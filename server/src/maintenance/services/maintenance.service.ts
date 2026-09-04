import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateMaintenanceDto } from '../dtos/create-maintenance.dto';
import { UpdateMaintenanceStatusDto } from '../dtos/update-maintenance-status.dto';
import { MaintenanceQueryDto } from '../dtos/maintenance-query.dto';
import type { MaintenanceStatus } from '../dtos/update-maintenance-status.dto';
import { UpdateMaintenanceDto } from '../dtos/update-maintenance.dto';
import type { Prisma } from '../../generated/prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    query: MaintenanceQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.MaintenanceRequestWhereInput = { organizationId };

    if (query.propertyId) {
      where.propertyId = query.propertyId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    const [items, total] = await Promise.all([
      this.prisma.maintenanceRequest.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          property: { include: { landlord: true } },
          unit: true,
          tenant: true,
          assignedTo: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.maintenanceRequest.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const request = await this.prisma.maintenanceRequest.findFirst({
      where: { id, organizationId },
      include: { property: true, unit: true, statusHistory: true },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    return request;
  }

  async create(organizationId: string, data: CreateMaintenanceDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: data.propertyId, organizationId },
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
          propertyId: data.propertyId,
          ...(data.unitId ? { unitId: data.unitId } : {}),
        },
      });
      if (!tenant) {
        throw new BadRequestException(
          'Tenant does not belong to property or unit',
        );
      }
    }

    return this.prisma.maintenanceRequest.create({
      data: {
        organizationId,
        ...data,
      },
    });
  }

  async updateStatus(
    organizationId: string,
    id: string,
    data: UpdateMaintenanceStatusDto,
    userId: string,
  ) {
    const request = await this.prisma.maintenanceRequest.findFirst({
      where: { id, organizationId },
    });

    if (!request) {
      throw new NotFoundException('Maintenance request not found');
    }

    const validTransitions: Record<MaintenanceStatus, MaintenanceStatus[]> = {
      OPEN: ['ASSIGNED', 'IN_PROGRESS'],
      ASSIGNED: ['IN_PROGRESS', 'OPEN'],
      IN_PROGRESS: ['COMPLETED', 'ASSIGNED'],
      COMPLETED: ['VERIFIED'],
      VERIFIED: [],
    };

    const allowed = validTransitions[request.status] || [];
    if (!allowed.includes(data.status)) {
      throw new BadRequestException(
        `Cannot transition from ${request.status} to ${data.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: {
          status: data.status,
          ...(data.status === 'COMPLETED'
            ? { completedAt: new Date(), completedById: userId }
            : {}),
          ...(data.status === 'VERIFIED'
            ? { verifiedAt: new Date(), verifiedById: userId }
            : {}),
        },
      });

      await tx.maintenanceStatusHistory.create({
        data: {
          maintenanceRequestId: id,
          status: data.status,
          actorUserId: userId,
          actorType: 'agency',
          notes: data.notes,
        },
      });

      return updated;
    });
  }

  async update(organizationId: string, id: string, data: UpdateMaintenanceDto) {
    const request = await this.prisma.maintenanceRequest.findFirst({ where: { id, organizationId } });
    if (!request) throw new NotFoundException('Maintenance request not found');
    if (data.assignedToId) {
      const employee = await this.prisma.employee.findFirst({ where: { userId: data.assignedToId, organizationId } });
      if (!employee) throw new BadRequestException('Assignee is not an agency employee');
    }
    return this.prisma.maintenanceRequest.update({
      where: { id },
      data: {
        assignedToId: data.assignedToId,
        priority: data.priority as never,
        estimatedCost: data.estimatedCost,
        actualCost: data.actualCost,
        description: data.description,
      },
    });
  }
}
