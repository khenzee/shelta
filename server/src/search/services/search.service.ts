import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async globalSearch(organizationId: string, query: string) {
    const [landlords, properties, tenants, leases] = await Promise.all([
      this.prisma.landlord.findMany({
        where: {
          organizationId,
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      }),
      this.prisma.property.findMany({
        where: {
          organizationId,
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      }),
      this.prisma.tenant.findMany({
        where: {
          organizationId,
          firstName: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      }),
      this.prisma.lease.findMany({
        where: {
          organizationId,
          tenant: { firstName: { contains: query, mode: 'insensitive' } },
        },
        take: 5,
      }),
    ]);

    return {
      landlords,
      properties,
      tenants,
      leases,
    };
  }
}
