import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTenantDto } from '../dtos/create-tenant.dto';
import { UpdateTenantDto } from '../dtos/update-tenant.dto';
import { TenantQueryDto } from '../dtos/tenant-query.dto';
import type { Prisma } from '../../generated/prisma/client';
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/environment';
import { createHash, randomBytes } from 'node:crypto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

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
        include: {
          property: true,
          unit: true,
          landlord: true,
          leases: {
            where: { status: { in: ['ACTIVE', 'EXPIRING'] } },
            orderBy: { endDate: 'desc' },
            take: 1,
          },
        },
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

    const rawToken = randomBytes(32).toString('base64url');
    const emailVerifyHash = createHash('sha256').update(rawToken).digest('hex');
    const emailVerifyExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const tenant = await this.prisma.tenant.create({
      data: {
        organizationId,
        ...data,
        email: data.email.toLowerCase(),
        emailVerifyHash,
        emailVerifyExpiry,
      },
    });
    let verificationEmailSent = true;
    const name = `${tenant.firstName} ${tenant.lastName}`;
    const url = `${this.config.get('FRONTEND_URL', { infer: true })}/verify-email?type=tenant&token=${encodeURIComponent(rawToken)}`;
    try {
      await this.mail.sendContactVerification(tenant.email, name, url);
    } catch {
      verificationEmailSent = false;
    }
    return { tenant, verificationEmailSent };
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
