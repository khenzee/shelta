import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LandlordGuard } from '../auth/guards/landlord.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { LandlordOnly } from '../auth/decorators/landlord.decorator';
import { NotFoundException } from '@nestjs/common';
import type { Prisma } from '../generated/prisma/client';
import type { TransactionType } from '../generated/prisma/enums';

@ApiTags('landlord-portal')
@Controller('landlord-portal')
@UseGuards(JwtAuthGuard, LandlordGuard)
@LandlordOnly()
@ApiBearerAuth()
export class LandlordPortalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('properties')
  @ApiOperation({ summary: 'List landlord properties' })
  async listProperties(
    @CurrentUser() user: JwtPayload,
    @Query('search') search?: string,
  ) {
    const where: Prisma.PropertyWhereInput = {
      organizationId: user.organizationId,
      landlordId: user.landlordId!,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    const properties = await this.prisma.property.findMany({
      where,
      include: { units: true, _count: { select: { units: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { items: properties, total: properties.length };
  }

  @Get('properties/:id')
  @ApiOperation({ summary: 'Get landlord property by ID' })
  async getProperty(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const property = await this.prisma.property.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        landlordId: user.landlordId!,
      },
      include: { units: true },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    return property;
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List landlord tenants' })
  async listTenants(
    @CurrentUser() user: JwtPayload,
    @Query('search') search?: string,
  ) {
    const where: Prisma.TenantWhereInput = {
      organizationId: user.organizationId,
      landlordId: user.landlordId!,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tenants = await this.prisma.tenant.findMany({
      where,
      include: { property: true, unit: true },
      orderBy: { createdAt: 'desc' },
    });

    return { items: tenants, total: tenants.length };
  }

  @Get('leases')
  @ApiOperation({ summary: 'List landlord leases' })
  async listLeases(@CurrentUser() user: JwtPayload) {
    const leases = await this.prisma.lease.findMany({
      where: {
        organizationId: user.organizationId,
        landlordId: user.landlordId!,
      },
      include: { tenant: true, unit: true, property: true },
      orderBy: { createdAt: 'desc' },
    });

    return { items: leases, total: leases.length };
  }

  @Get('finances')
  @ApiOperation({ summary: 'List landlord transactions' })
  async listTransactions(
    @CurrentUser() user: JwtPayload,
    @Query('type') type?: TransactionType,
  ) {
    const where: Prisma.TransactionWhereInput = {
      organizationId: user.organizationId,
      landlordId: user.landlordId!,
    };

    if (type) {
      where.type = type;
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      include: { property: true },
      orderBy: { transactionDate: 'desc' },
    });

    return { items: transactions, total: transactions.length };
  }

  @Get('maintenance')
  @ApiOperation({ summary: 'List landlord maintenance requests' })
  async listMaintenance(@CurrentUser() user: JwtPayload) {
    const requests = await this.prisma.maintenanceRequest.findMany({
      where: {
        organizationId: user.organizationId,
        property: { landlordId: user.landlordId! },
      },
      include: { property: true, unit: true },
      orderBy: { createdAt: 'desc' },
    });

    return { items: requests, total: requests.length };
  }
}
