import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: { organizationId },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: true, role: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where: { organizationId } }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, organizationId },
      include: { user: true, role: true },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }
}
