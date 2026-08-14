import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CommunicationQueryDto } from '../dtos/communication-query.dto';
import type { Prisma } from '../../generated/prisma/client';

@Injectable()
export class CommunicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    organizationId: string,
    query: CommunicationQueryDto,
    page = 1,
    limit = 20,
  ) {
    const where: Prisma.CommunicationWhereInput = { organizationId };

    if (query.channel) {
      where.channel = query.channel;
    }

    if (query.status) {
      where.status = query.status;
    }

    const [items, total] = await Promise.all([
      this.prisma.communication.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.communication.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}
