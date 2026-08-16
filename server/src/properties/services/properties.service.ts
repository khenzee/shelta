import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreatePropertyDto } from '../dtos/create-property.dto';
import { UpdatePropertyDto } from '../dtos/update-property.dto';
import { PropertyQueryDto } from '../dtos/property-query.dto';
import type { Prisma } from '../../generated/prisma/client';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    query: PropertyQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.PropertyWhereInput = { organizationId };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { address: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.landlordId) {
      where.landlordId = query.landlordId;
    }

    if (query.city) {
      where.city = query.city;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          landlord: true,
          units: { select: { status: true, monthlyRent: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.property.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, organizationId },
      include: { landlord: true, units: true },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  async create(organizationId: string, data: CreatePropertyDto) {
    const landlord = await this.prisma.landlord.findFirst({
      where: { id: data.landlordId, organizationId, status: 'ACTIVE' },
    });
    if (!landlord) throw new NotFoundException('Landlord not found');

    const lastProperty = await this.prisma.property.findFirst({
      where: { organizationId },
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    const lastNumber = Number(lastProperty?.code.match(/(\d+)$/)?.[1] ?? 0);
    const code = `PRP-${String(lastNumber + 1).padStart(5, '0')}`;

    return this.prisma.property.create({
      data: {
        organizationId,
        code,
        ...data,
      },
    });
  }

  async update(organizationId: string, id: string, data: UpdatePropertyDto) {
    const property = await this.prisma.property.findFirst({
      where: { id, organizationId },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return this.prisma.property.update({
      where: { id },
      data,
    });
  }

  async archive(organizationId: string, id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, organizationId },
      include: {
        units: { where: { status: { not: 'ARCHIVED' } } },
        leases: { where: { status: { in: ['DRAFT', 'ACTIVE', 'EXPIRING'] } } },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.units.length > 0 || property.leases.length > 0) {
      throw new BadRequestException(
        'Cannot archive property with active units or leases',
      );
    }

    return this.prisma.property.update({
      where: { id },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    });
  }
}
