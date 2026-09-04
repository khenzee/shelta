import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { TransactionQueryDto } from '../dtos/transaction-query.dto';
import type { Prisma } from '../../generated/prisma/client';

@Injectable()
export class FinancesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    query: TransactionQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.TransactionWhereInput = { organizationId };

    if (query.landlordId) {
      where.landlordId = query.landlordId;
    }

    if (query.propertyId) {
      where.propertyId = query.propertyId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = query.category;
    }

    const [items, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { landlord: true, property: true },
        orderBy: { transactionDate: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async rentSchedule(
    organizationId: string,
    query: TransactionQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.RentChargeWhereInput = {
      lease: {
        organizationId,
        ...(query.landlordId ? { landlordId: query.landlordId } : {}),
        ...(query.propertyId ? { propertyId: query.propertyId } : {}),
      },
    };

    const [items, total] = await Promise.all([
      this.prisma.rentCharge.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          lease: {
            include: {
              tenant: true,
              unit: true,
              property: true,
              landlord: true,
            },
          },
        },
        orderBy: { dueDate: 'desc' },
      }),
      this.prisma.rentCharge.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async create(
    organizationId: string,
    data: CreateTransactionDto,
    createdById: string,
  ) {
    const property = await this.prisma.property.findFirst({
      where: {
        id: data.propertyId,
        landlordId: data.landlordId,
        organizationId,
      },
    });
    if (!property) throw new NotFoundException('Property not found');

    if (data.unitId) {
      const unit = await this.prisma.unit.findFirst({
        where: { id: data.unitId, propertyId: data.propertyId },
      });
      if (!unit) throw new NotFoundException('Unit not found');
    }

    if (data.tenantId) {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          id: data.tenantId,
          organizationId,
          landlordId: data.landlordId,
          propertyId: data.propertyId,
        },
      });
      if (!tenant) throw new NotFoundException('Tenant not found');
    }

    return this.prisma.transaction.create({
      data: {
        organizationId,
        ...data,
        transactionDate: new Date(data.transactionDate),
        createdById,
      },
    });
  }

  async void(organizationId: string, id: string, voidedById: string) {
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, organizationId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return this.prisma.transaction.update({
      where: { id },
      data: { status: 'VOIDED', voidedById, voidedAt: new Date() },
    });
  }
}
