import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from '../dtos/create-tenant.dto';
import { UpdateTenantDto } from '../dtos/update-tenant.dto';
import { TenantQueryDto } from '../dtos/tenant-query.dto';
import type { Prisma } from '../../generated/prisma/client';

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    query: TenantQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.TenantWhereInput = { organizationId };

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.landlordId) {
      where.landlordId = query.landlordId;
    }

    if (query.propertyId) {
      where.propertyId = query.propertyId;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { property: true, unit: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, organizationId },
      include: { property: true, unit: true, leases: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async create(organizationId: string, data: CreateTenantDto) {
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

    return this.prisma.tenant.create({
      data: {
        organizationId,
        ...data,
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, organizationId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  async archive(organizationId: string, id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, organizationId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return this.prisma.tenant.update({
      where: { id },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    });
  }
}
