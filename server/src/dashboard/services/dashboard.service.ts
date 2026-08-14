import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAgencyDashboard(organizationId: string) {
    const [
      totalLandlords,
      totalProperties,
      totalTenants,
      activeLeases,
      pendingMaintenance,
      recentTransactions,
    ] = await Promise.all([
      this.prisma.landlord.count({
        where: { organizationId, status: 'ACTIVE' },
      }),
      this.prisma.property.count({
        where: { organizationId, status: { not: 'ARCHIVED' } },
      }),
      this.prisma.tenant.count({ where: { organizationId, status: 'ACTIVE' } }),
      this.prisma.lease.count({ where: { organizationId, status: 'ACTIVE' } }),
      this.prisma.maintenanceRequest.count({
        where: { organizationId, status: { not: 'VERIFIED' } },
      }),
      this.prisma.transaction.findMany({
        where: { organizationId, status: 'COMPLETED' },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalLandlords,
      totalProperties,
      totalTenants,
      activeLeases,
      pendingMaintenance,
      recentTransactions,
    };
  }
}
