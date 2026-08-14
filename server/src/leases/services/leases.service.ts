import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLeaseDto } from '../dtos/create-lease.dto';
import { UpdateLeaseDto } from '../dtos/update-lease.dto';
import { LeaseQueryDto } from '../dtos/lease-query.dto';
import type { Prisma } from '../../generated/prisma/client';

@Injectable()
export class LeasesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    query: LeaseQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.LeaseWhereInput = { organizationId };

    if (query.tenantId) {
      where.tenantId = query.tenantId;
    }

    if (query.unitId) {
      where.unitId = query.unitId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.lease.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { tenant: true, unit: true, property: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.lease.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const lease = await this.prisma.lease.findFirst({
      where: { id, organizationId },
      include: { tenant: true, unit: true, property: true },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    return lease;
  }

  async create(organizationId: string, data: CreateLeaseDto) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    if (endDate <= startDate) {
      throw new BadRequestException('Lease end date must be after start date');
    }

    const tenant = await this.prisma.tenant.findFirst({
      where: { id: data.tenantId, organizationId },
    });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const unit = await this.prisma.unit.findFirst({
      where: { id: data.unitId, property: { organizationId } },
      include: { property: true },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    if (
      unit.propertyId !== tenant.propertyId ||
      (tenant.unitId && tenant.unitId !== unit.id)
    ) {
      throw new BadRequestException(
        'Tenant and unit do not belong to the same property',
      );
    }

    const overlapping = await this.prisma.lease.findFirst({
      where: {
        organizationId,
        unitId: data.unitId,
        status: { in: ['DRAFT', 'ACTIVE', 'EXPIRING'] },
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });

    if (overlapping) {
      throw new BadRequestException('Unit has an overlapping active lease');
    }

    return this.prisma.lease.create({
      data: {
        organizationId,
        tenantId: data.tenantId,
        unitId: data.unitId,
        startDate,
        endDate,
        paymentSchedule: data.paymentSchedule,
        signedDocumentId: data.signedDocumentId,
        landlordId: unit.property.landlordId,
        propertyId: unit.propertyId,
        rentAmount: unit.monthlyRent,
        securityDeposit: unit.securityDeposit,
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateLeaseDto) {
    const lease = await this.prisma.lease.findFirst({
      where: { id, organizationId },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found');
    }

    return this.prisma.lease.update({
      where: { id },
      data,
    });
  }
}
