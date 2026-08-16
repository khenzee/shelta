import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getAgencyDashboard(
    organizationId: string,
    userId: string,
    role: string | null,
  ) {
    const now = new Date();
    const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
    const leaseWindow = new Date(now.getTime() + 30 * 86400000);
    const [
      totalLandlords,
      totalProperties,
      totalTenants,
      activeLeases,
      pendingMaintenance,
      recentTransactions,
      units,
      transactions,
      notifications,
      expiringLeases,
      urgentMaintenance,
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
        where: { organizationId, status: 'COMPLETED', ...(role === 'ADMIN' ? {} : { id: '__hidden__' }) },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.unit.findMany({
        where: { property: { organizationId }, status: { not: 'ARCHIVED' } },
        select: { status: true },
      }),
      role === 'ADMIN'
        ? this.prisma.transaction.findMany({
            where: {
              organizationId,
              status: 'COMPLETED',
              transactionDate: { gte: yearStart, lte: now },
            },
            select: { type: true, amount: true, transactionDate: true },
          })
        : Promise.resolve([]),
      this.prisma.notification.findMany({
        where: { userId },
        select: { id: true, title: true, body: true, readAt: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.lease.findMany({
        where: {
          organizationId,
          status: { in: ['ACTIVE', 'EXPIRING'] },
          endDate: { gte: now, lte: leaseWindow },
        },
        select: {
          id: true,
          endDate: true,
          tenant: { select: { firstName: true, lastName: true } },
          property: { select: { name: true } },
        },
        orderBy: { endDate: 'asc' },
        take: 5,
      }),
      this.prisma.maintenanceRequest.findMany({
        where: {
          organizationId,
          priority: { in: ['HIGH', 'URGENT'] },
          status: { not: 'VERIFIED' },
        },
        select: { id: true, title: true, priority: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
        take: 5,
      }),
    ]);

    const unitStatus = {
      occupied: units.filter((unit) => unit.status === 'OCCUPIED').length,
      vacant: units.filter((unit) => unit.status === 'VACANT').length,
      underRepair: units.filter((unit) => unit.status === 'UNDER_REPAIR').length,
      total: units.length,
    };
    const monthlyFinance = Array.from({ length: 12 }, (_, month) => ({
      month,
      income: 0,
      expenses: 0,
    }));
    for (const transaction of transactions) {
      const month = transaction.transactionDate.getUTCMonth();
      const amount = Number(transaction.amount);
      if (transaction.type === 'INCOME') monthlyFinance[month].income += amount;
      else monthlyFinance[month].expenses += amount;
    }
    const finance = role === 'ADMIN'
      ? {
          income: monthlyFinance.reduce((sum, month) => sum + month.income, 0),
          expenses: monthlyFinance.reduce((sum, month) => sum + month.expenses, 0),
          monthly: monthlyFinance,
        }
      : null;
    const tasks = [
      ...expiringLeases.map((lease) => ({
        id: lease.id,
        type: 'LEASE',
        date: lease.endDate,
        title: `Lease expires for ${lease.tenant.firstName} ${lease.tenant.lastName}`,
        detail: lease.property.name,
      })),
      ...urgentMaintenance.map((request) => ({
        id: request.id,
        type: 'MAINTENANCE',
        date: request.createdAt,
        title: request.title,
        detail: `${request.priority} priority maintenance`,
      })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 5);

    return {
      totalLandlords,
      totalProperties,
      totalTenants,
      activeLeases,
      pendingMaintenance,
      recentTransactions,
      unitStatus,
      finance,
      notifications,
      unreadNotifications: notifications.filter((item) => !item.readAt).length,
      tasks,
    };
  }
}
