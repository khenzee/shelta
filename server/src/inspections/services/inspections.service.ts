import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateInspectionDto } from '../dtos/create-inspection.dto';
import { InspectionQueryDto } from '../dtos/inspection-query.dto';
import type { Prisma } from '../../generated/prisma/client';

@Injectable()
export class InspectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    query: InspectionQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.InspectionWhereInput = { organizationId };

    if (query.propertyId) {
      where.propertyId = query.propertyId;
    }

    const [items, total] = await Promise.all([
      this.prisma.inspection.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
      }),
      this.prisma.inspection.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const inspection = await this.prisma.inspection.findFirst({
      where: { id, organizationId },
    });

    if (!inspection) {
      throw new NotFoundException('Inspection not found');
    }

    return inspection;
  }

  async create(organizationId: string, data: CreateInspectionDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: data.propertyId, organizationId },
    });
    if (!property) throw new NotFoundException('Property not found');

    if (data.unitId) {
      const unit = await this.prisma.unit.findFirst({
        where: { id: data.unitId, propertyId: data.propertyId },
      });
      if (!unit)
        throw new BadRequestException('Unit does not belong to property');
    }

    if (data.tenantId) {
      const tenant = await this.prisma.tenant.findFirst({
        where: {
          id: data.tenantId,
          organizationId,
          propertyId: data.propertyId,
        },
      });
      if (!tenant)
        throw new BadRequestException('Tenant does not belong to property');
    }

    const inspector = await this.prisma.user.findFirst({
      where: {
        id: data.inspectorId,
        organizationId,
        type: 'AGENCY',
        status: 'ACTIVE',
      },
    });
    if (!inspector) throw new NotFoundException('Inspector not found');

    return this.prisma.inspection.create({
      data: {
        organizationId,
        ...data,
        scheduledDate: new Date(data.scheduledDate),
      },
    });
  }
}
