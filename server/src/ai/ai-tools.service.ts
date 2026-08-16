import { BadRequestException, Injectable, ForbiddenException } from '@nestjs/common';
import { tool } from 'ai';
import { z } from 'zod';
import { PrismaService } from '../database/prisma.service';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class AiToolsService {
  constructor(private readonly prisma: PrismaService) {}

  private async record(user: JwtPayload, conversationId: string, toolName: string, args: object, result: unknown) {
    const summary = JSON.stringify(result).slice(0, 1000);
    await Promise.all([
      this.prisma.aiToolExecution.create({ data: { organizationId: user.organizationId, userId: user.sub, conversationId, toolName, arguments: args, resultSummary: summary, outcome: 'SUCCESS' } }),
      this.prisma.auditEvent.create({ data: { organizationId: user.organizationId, actorUserId: user.sub, action: `ai.tool.${toolName}`, resourceType: 'AI_ASSISTANT', resourceId: conversationId, newValue: { arguments: args, summary } } }),
    ]);
    return result;
  }

  private period(startDate?: string, endDate?: string) {
    const end = endDate ? new Date(`${endDate}T23:59:59.999Z`) : new Date();
    const start = startDate
      ? new Date(`${startDate}T00:00:00.000Z`)
      : new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      throw new BadRequestException('Invalid analytics date range');
    }
    if (end.getTime() - start.getTime() > 366 * 86400000) {
      throw new BadRequestException('Analytics date range cannot exceed one year');
    }
    return { start, end };
  }

  private async denyFinancial(user: JwtPayload, conversationId: string, toolName: string, args: object) {
    await this.prisma.aiToolExecution.create({
      data: {
        organizationId: user.organizationId,
        userId: user.sub,
        conversationId,
        toolName,
        arguments: args,
        outcome: 'DENIED',
        resultSummary: 'Admin role required',
      },
    });
    throw new ForbiddenException('Financial data requires Admin access');
  }

  create(user: JwtPayload, conversationId: string) {
    const organizationId = user.organizationId;
    return {
      getBusinessOverview: tool({
        description: 'Get a concise agency-wide KPI overview. Financial KPIs are included only for Admin.',
        inputSchema: z.object({}),
        execute: async () => {
          const [landlords, properties, units, occupiedUnits, tenants, activeLeases, openMaintenance] = await Promise.all([
            this.prisma.landlord.count({ where: { organizationId, status: { not: 'ARCHIVED' } } }),
            this.prisma.property.count({ where: { organizationId, status: { not: 'ARCHIVED' } } }),
            this.prisma.unit.count({ where: { property: { organizationId }, status: { not: 'ARCHIVED' } } }),
            this.prisma.unit.count({ where: { property: { organizationId }, status: 'OCCUPIED' } }),
            this.prisma.tenant.count({ where: { organizationId, status: 'ACTIVE' } }),
            this.prisma.lease.count({ where: { organizationId, status: { in: ['ACTIVE', 'EXPIRING'] } } }),
            this.prisma.maintenanceRequest.count({ where: { organizationId, status: { not: 'VERIFIED' } } }),
          ]);
          const result: Record<string, unknown> = {
            landlords,
            properties,
            units,
            occupiedUnits,
            vacantUnits: units - occupiedUnits,
            occupancyRate: units ? Number(((occupiedUnits / units) * 100).toFixed(1)) : 0,
            activeTenants: tenants,
            activeLeases,
            openMaintenance,
          };
          if (user.role === 'ADMIN') {
            const financials = await this.prisma.transaction.groupBy({
              by: ['type'],
              where: { organizationId, status: 'COMPLETED' },
              _sum: { amount: true },
            });
            const income = Number(financials.find((item) => item.type === 'INCOME')?._sum.amount ?? 0);
            const expenses = Number(financials.find((item) => item.type === 'EXPENSE')?._sum.amount ?? 0);
            result.income = income;
            result.expenses = expenses;
            result.netIncome = income - expenses;
          }
          return this.record(user, conversationId, 'getBusinessOverview', {}, result);
        },
      }),
      getOccupancyAnalytics: tool({
        description: 'Get occupancy totals and the properties with the most vacant units.',
        inputSchema: z.object({ limit: z.number().int().min(1).max(10).default(5) }),
        execute: async ({ limit }) => {
          const properties = await this.prisma.property.findMany({
            where: { organizationId, status: { not: 'ARCHIVED' } },
            select: { id: true, name: true, units: { select: { status: true } } },
          });
          const rows = properties.map((property) => {
            const occupied = property.units.filter((unit) => unit.status === 'OCCUPIED').length;
            const vacant = property.units.filter((unit) => unit.status === 'VACANT').length;
            return { id: property.id, name: property.name, units: property.units.length, occupied, vacant };
          });
          const units = rows.reduce((sum, row) => sum + row.units, 0);
          const occupied = rows.reduce((sum, row) => sum + row.occupied, 0);
          const result = {
            units,
            occupied,
            vacant: rows.reduce((sum, row) => sum + row.vacant, 0),
            occupancyRate: units ? Number(((occupied / units) * 100).toFixed(1)) : 0,
            highestVacancy: rows.sort((a, b) => b.vacant - a.vacant).slice(0, limit),
          };
          return this.record(user, conversationId, 'getOccupancyAnalytics', { limit }, result);
        },
      }),
      getRevenueAnalytics: tool({
        description: 'Get income, expenses, and net income for a date range. Admin only.',
        inputSchema: z.object({
          startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        }),
        execute: async (args) => {
          if (user.role !== 'ADMIN') return this.denyFinancial(user, conversationId, 'getRevenueAnalytics', args);
          const { start, end } = this.period(args.startDate, args.endDate);
          const rows = await this.prisma.transaction.groupBy({
            by: ['type'],
            where: { organizationId, status: 'COMPLETED', transactionDate: { gte: start, lte: end } },
            _sum: { amount: true },
            _count: true,
          });
          const income = Number(rows.find((item) => item.type === 'INCOME')?._sum.amount ?? 0);
          const expenses = Number(rows.find((item) => item.type === 'EXPENSE')?._sum.amount ?? 0);
          return this.record(user, conversationId, 'getRevenueAnalytics', args, {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            income,
            expenses,
            netIncome: income - expenses,
            transactionCount: rows.reduce((sum, row) => sum + row._count, 0),
          });
        },
      }),
      getCollectionAnalytics: tool({
        description: 'Get rent due, paid, outstanding, and collection rate for a date range. Admin only.',
        inputSchema: z.object({
          startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        }),
        execute: async (args) => {
          if (user.role !== 'ADMIN') return this.denyFinancial(user, conversationId, 'getCollectionAnalytics', args);
          const { start, end } = this.period(args.startDate, args.endDate);
          const aggregate = await this.prisma.rentCharge.aggregate({
            where: {
              dueDate: { gte: start, lte: end },
              lease: { organizationId },
            },
            _sum: { amountDue: true, amountPaid: true },
            _count: true,
          });
          const due = Number(aggregate._sum.amountDue ?? 0);
          const paid = Number(aggregate._sum.amountPaid ?? 0);
          return this.record(user, conversationId, 'getCollectionAnalytics', args, {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            charges: aggregate._count,
            due,
            paid,
            outstanding: Math.max(0, due - paid),
            collectionRate: due ? Number(((paid / due) * 100).toFixed(1)) : 0,
          });
        },
      }),
      getMaintenanceAnalytics: tool({
        description: 'Get maintenance workload, cost exposure, and category breakdown for a date range.',
        inputSchema: z.object({
          startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        }),
        execute: async (args) => {
          const { start, end } = this.period(args.startDate, args.endDate);
          const requests = await this.prisma.maintenanceRequest.findMany({
            where: { organizationId, createdAt: { gte: start, lte: end } },
            select: { category: true, status: true, priority: true, estimatedCost: true, actualCost: true },
          });
          const categories = new Map<string, number>();
          for (const request of requests) categories.set(request.category, (categories.get(request.category) ?? 0) + 1);
          const result = {
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            total: requests.length,
            open: requests.filter((request) => request.status !== 'VERIFIED').length,
            completed: requests.filter((request) => ['COMPLETED', 'VERIFIED'].includes(request.status)).length,
            urgent: requests.filter((request) => request.priority === 'URGENT').length,
            estimatedCost: requests.reduce((sum, request) => sum + Number(request.estimatedCost ?? 0), 0),
            actualCost: requests.reduce((sum, request) => sum + Number(request.actualCost ?? 0), 0),
            categories: [...categories.entries()].map(([category, count]) => ({ category, count })).sort((a, b) => b.count - a.count),
          };
          return this.record(user, conversationId, 'getMaintenanceAnalytics', args, result);
        },
      }),
      searchLandlords: tool({
        description: 'Search registered landlords by name, email, or code. Returns verification and portal status.',
        inputSchema: z.object({ query: z.string().max(120).default('') }),
        execute: async ({ query }) => this.record(user, conversationId, 'searchLandlords', { query }, await this.prisma.landlord.findMany({ where: { organizationId, status: { not: 'ARCHIVED' }, ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }, { code: { contains: query, mode: 'insensitive' } }] } : {}) }, select: { id: true, code: true, name: true, email: true, emailVerifiedAt: true, portalStatus: true, status: true }, take: 10 })),
      }),
      searchProperties: tool({
        description: 'Search agency properties by name, address, city, or code. Returns up to 10 CRM records.',
        inputSchema: z.object({ query: z.string().max(120).default('') }),
        execute: async ({ query }) => this.record(user, conversationId, 'searchProperties', { query }, await this.prisma.property.findMany({ where: { organizationId, status: { not: 'ARCHIVED' }, ...(query ? { OR: [{ name: { contains: query, mode: 'insensitive' } }, { address: { contains: query, mode: 'insensitive' } }, { city: { contains: query, mode: 'insensitive' } }, { code: { contains: query, mode: 'insensitive' } }] } : {}) }, select: { id: true, code: true, name: true, address: true, city: true, status: true }, take: 10 })),
      }),
      listVacantUnits: tool({
        description: 'List vacant units, optionally filtered by property name.',
        inputSchema: z.object({ property: z.string().max(120).optional() }),
        execute: async ({ property }) => this.record(user, conversationId, 'listVacantUnits', { property }, await this.prisma.unit.findMany({ where: { status: 'VACANT', property: { organizationId, ...(property ? { name: { contains: property, mode: 'insensitive' } } : {}) } }, select: { id: true, number: true, type: true, bedrooms: true, monthlyRent: true, property: { select: { id: true, name: true } } }, take: 20 })),
      }),
      listExpiringLeases: tool({
        description: 'List active leases expiring within a specified number of days.',
        inputSchema: z.object({ days: z.number().int().min(1).max(365).default(30) }),
        execute: async ({ days }) => {
          const end = new Date(Date.now() + days * 86400000);
          return this.record(user, conversationId, 'listExpiringLeases', { days }, await this.prisma.lease.findMany({ where: { organizationId, status: { in: ['ACTIVE', 'EXPIRING'] }, endDate: { gte: new Date(), lte: end } }, select: { id: true, endDate: true, rentAmount: true, tenant: { select: { id: true, firstName: true, lastName: true } }, property: { select: { id: true, name: true } }, unit: { select: { id: true, number: true } } }, orderBy: { endDate: 'asc' }, take: 20 }));
        },
      }),
      searchTenants: tool({
        description: 'Search tenants by name or email. Returns contact verification and assigned property information.',
        inputSchema: z.object({ query: z.string().min(1).max(120) }),
        execute: async ({ query }) => this.record(user, conversationId, 'searchTenants', { query }, await this.prisma.tenant.findMany({ where: { organizationId, status: { not: 'ARCHIVED' }, OR: [{ firstName: { contains: query, mode: 'insensitive' } }, { lastName: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }] }, select: { id: true, firstName: true, lastName: true, email: true, emailVerifiedAt: true, status: true, property: { select: { id: true, name: true } }, unit: { select: { id: true, number: true } } }, take: 10 })),
      }),
      listMaintenance: tool({
        description: 'List open maintenance requests by optional priority or status.',
        inputSchema: z.object({ priority: z.string().optional(), status: z.string().optional() }),
        execute: async ({ priority, status }) => this.record(user, conversationId, 'listMaintenance', { priority, status }, await this.prisma.maintenanceRequest.findMany({ where: { organizationId, ...(priority ? { priority: priority as never } : {}), ...(status ? { status: status as never } : { status: { not: 'VERIFIED' } }) }, select: { id: true, title: true, priority: true, status: true, estimatedCost: true, property: { select: { id: true, name: true } }, unit: { select: { id: true, number: true } } }, orderBy: { createdAt: 'desc' }, take: 20 })),
      }),
      getFinancialSummary: tool({
        description: 'Get agency financial transaction totals. This tool is restricted to Admin.',
        inputSchema: z.object({}),
        execute: async () => {
          if (user.role !== 'ADMIN') {
            await this.prisma.aiToolExecution.create({ data: { organizationId, userId: user.sub, conversationId, toolName: 'getFinancialSummary', arguments: {}, outcome: 'DENIED', resultSummary: 'Admin role required' } });
            throw new ForbiddenException('Financial data requires Admin access');
          }
          const result = await this.prisma.transaction.groupBy({ by: ['type'], where: { organizationId, status: 'COMPLETED' }, _sum: { amount: true }, _count: true });
          return this.record(user, conversationId, 'getFinancialSummary', {}, result);
        },
      }),
    };
  }
}
