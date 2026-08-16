import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateLandlordDto } from '../dtos/create-landlord.dto';
import { UpdateLandlordDto } from '../dtos/update-landlord.dto';
import { LandlordQueryDto } from '../dtos/landlord-query.dto';
import type { Prisma } from '../../generated/prisma/client';
import { MailService } from '../../mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/environment';
import { createHash, randomBytes } from 'node:crypto';

@Injectable()
export class LandlordsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async list(
    organizationId: string,
    query: LandlordQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.LandlordWhereInput = { organizationId };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.landlord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.landlord.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const landlord = await this.prisma.landlord.findFirst({
      where: { id, organizationId },
      include: { properties: true },
    });

    if (!landlord) {
      throw new NotFoundException('Landlord not found');
    }

    return landlord;
  }

  async create(organizationId: string, data: CreateLandlordDto) {
    const lastLandlord = await this.prisma.landlord.findFirst({
      where: { organizationId },
      orderBy: { code: 'desc' },
      select: { code: true },
    });
    const lastNumber = Number(lastLandlord?.code.match(/(\d+)$/)?.[1] ?? 0);
    const code = `LLD-${String(lastNumber + 1).padStart(5, '0')}`;

    const rawToken = randomBytes(32).toString('base64url');
    const emailVerifyHash = createHash('sha256').update(rawToken).digest('hex');
    const emailVerifyExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const landlord = await this.prisma.landlord.create({
      data: {
        organizationId,
        code,
        ...data,
        email: data.email.toLowerCase(),
        emailVerifyHash,
        emailVerifyExpiry,
      },
    });

    let verificationEmailSent = true;
    const url = `${this.config.get('FRONTEND_URL', { infer: true })}/verify-email?type=landlord&token=${encodeURIComponent(rawToken)}`;
    try {
      await this.mail.sendContactVerification(landlord.email, landlord.name, url);
    } catch {
      verificationEmailSent = false;
    }
    return { landlord, verificationEmailSent };
  }

  async update(organizationId: string, id: string, data: UpdateLandlordDto) {
    const landlord = await this.prisma.landlord.findFirst({
      where: { id, organizationId },
    });

    if (!landlord) {
      throw new NotFoundException('Landlord not found');
    }

    return this.prisma.landlord.update({
      where: { id },
      data,
    });
  }

  async archive(organizationId: string, id: string) {
    const landlord = await this.prisma.landlord.findFirst({
      where: { id, organizationId },
      include: {
        properties: { where: { status: { not: 'ARCHIVED' } } },
        leases: { where: { status: { in: ['DRAFT', 'ACTIVE', 'EXPIRING'] } } },
      },
    });

    if (!landlord) {
      throw new NotFoundException('Landlord not found');
    }

    if (landlord.properties.length > 0 || landlord.leases.length > 0) {
      throw new BadRequestException(
        'Cannot archive landlord with active properties or leases',
      );
    }

    return this.prisma.landlord.update({
      where: { id },
      data: { status: 'ARCHIVED', archivedAt: new Date() },
    });
  }
}
