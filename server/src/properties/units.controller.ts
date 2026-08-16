import { Body, Controller, Get, NotFoundException, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { UnitQueryDto } from './dtos/unit-query.dto';
import { CreateUnitDto } from './dtos/create-unit.dto';

@ApiTags('units')
@Controller('units')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UnitsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'List units' })
  async list(@CurrentUser() user: JwtPayload, @Query() query: UnitQueryDto) {
    const where = {
      property: { organizationId: user.organizationId },
      ...(query.propertyId ? { propertyId: query.propertyId } : {}),
      ...(query.search
        ? { number: { contains: query.search, mode: 'insensitive' as const } }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        include: { property: { include: { landlord: true } }, tenants: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.unit.count({ where }),
    ]);
    return { items, total, page: 1, limit: total };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Create unit' })
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateUnitDto) {
    const property = await this.prisma.property.findFirst({
      where: { id: dto.propertyId, organizationId: user.organizationId },
    });
    if (!property) throw new NotFoundException('Property not found');
    return this.prisma.unit.create({ data: dto });
  }
}
