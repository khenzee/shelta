import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateComplaintDto } from '../dtos/create-complaint.dto';

@Injectable()
export class ComplaintsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.complaint.findMany({
        where: { organizationId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complaint.count({ where: { organizationId } }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const complaint = await this.prisma.complaint.findFirst({
      where: { id, organizationId },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    return complaint;
  }

  async create(organizationId: string, data: CreateComplaintDto) {
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

    return this.prisma.complaint.create({
      data: {
        organizationId,
        ...data,
      },
    });
  }
}
