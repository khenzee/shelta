import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../../mail/mail.service';
import { CreateEmployeeDto } from '../dtos/create-employee.dto';
import { createHash, randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/environment';

@Injectable()
export class EmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async list(organizationId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where: { organizationId },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: true,
          role: true,
          properties: { include: { property: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where: { organizationId } }),
    ]);

    return { items, total, page, limit };
  }

  async get(organizationId: string, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, organizationId },
      include: {
        user: true,
        role: true,
        properties: { include: { property: true } },
      },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found');
    }

    return employee;
  }

  async listRoles(organizationId: string) {
    const items = await this.prisma.role.findMany({
      where: { organizationId, name: { in: ['ADMIN', 'MANAGER', 'AGENT'] } },
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
    return { items };
  }

  async invite(organizationId: string, invitedById: string, dto: CreateEmployeeDto) {
    const role = await this.prisma.role.findFirst({
      where: { id: dto.roleId, organizationId },
    });
    if (!role) throw new NotFoundException('Role not found');
    if (role.name === 'ADMIN' || role.name === 'Super Admin') {
      throw new ConflictException('Admin invitations are disabled');
    }

    const existing = await this.prisma.user.findFirst({
      where: { organizationId, email: { equals: dto.email, mode: 'insensitive' } },
    });
    if (existing) throw new ConflictException('An account already exists for this email');

    const rawToken = randomBytes(32).toString('base64url');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const employee = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          organizationId,
          email: dto.email.toLowerCase(),
          name: dto.name,
          type: 'AGENCY',
          status: 'INVITED',
        },
      });
      const createdEmployee = await tx.employee.create({
        data: {
          organizationId,
          userId: user.id,
          roleId: dto.roleId,
          department: dto.department,
          jobTitle: dto.jobTitle,
          status: 'INVITED',
        },
      });
      await tx.invitation.create({
        data: { userId: user.id, invitedById, tokenHash, expiresAt },
      });
      return createdEmployee;
    });

    const invitationUrl = `${this.config.get('FRONTEND_URL', { infer: true })}/accept-invite?token=${encodeURIComponent(rawToken)}`;
    try {
      await this.mail.sendInvitation(dto.email, dto.name, invitationUrl);
    } catch (error) {
      await this.prisma.invitation.deleteMany({
        where: { userId: employee.userId, acceptedAt: null },
      });
      await this.prisma.user.delete({ where: { id: employee.userId } });
      throw error;
    }

    return { message: 'Invitation sent', employeeId: employee.id, expiresAt };
  }
}
