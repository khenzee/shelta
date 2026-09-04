import { Body, Controller, Delete, Get, NotFoundException, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { UnitQueryDto } from './dtos/unit-query.dto';
import { CreateUnitDto } from './dtos/create-unit.dto';
import { UpdateUnitDto } from './dtos/update-unit.dto';

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
    const page = query.page ?? 1;
    const limit = query.limit ?? 100;
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.unit.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  async get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const unit = await this.prisma.unit.findFirst({
      where: { id, property: { organizationId: user.organizationId } },
      include: { property: { include: { landlord: true } }, tenants: true, leases: true },
    });
    if (!unit) throw new NotFoundException('Unit not found');
    return unit;
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  async update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateUnitDto) {
    await this.get(user, id);
    return this.prisma.unit.update({ where: { id }, data: dto });
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  async archive(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    await this.get(user, id);
    return this.prisma.unit.update({ where: { id }, data: { status: 'ARCHIVED' } });
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
