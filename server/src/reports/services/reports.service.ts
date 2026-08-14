import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOccupancyReport(organizationId: string) {
    const [totalUnits, occupiedUnits] = await Promise.all([
      this.prisma.unit.count({
        where: {
          property: { organizationId, status: { not: 'ARCHIVED' } },
          status: { not: 'ARCHIVED' },
        },
      }),
      this.prisma.unit.count({
        where: {
          property: { organizationId, status: { not: 'ARCHIVED' } },
          status: 'OCCUPIED',
        },
      }),
    ]);

    const occupancyRate =
      totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

    return {
      totalUnits,
      occupiedUnits,
      vacantUnits: totalUnits - occupiedUnits,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
    };
  }

  async getFinancialReport(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const [income, expenses] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          organizationId,
          type: 'INCOME',
          transactionDate: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          organizationId,
          type: 'EXPENSE',
          transactionDate: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      income: Number(income._sum.amount || 0),
      expenses: Number(expenses._sum.amount || 0),
      netIncome:
        Number(income._sum.amount || 0) - Number(expenses._sum.amount || 0),
    };
  }
}
