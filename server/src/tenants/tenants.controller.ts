import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './services/tenants.service';
import { CreateTenantDto } from './dtos/create-tenant.dto';
import { UpdateTenantDto } from './dtos/update-tenant.dto';
import { TenantQueryDto } from './dtos/tenant-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'List tenants' })
  list(@CurrentUser() user: JwtPayload, @Query() query: TenantQueryDto) {
    return this.tenantsService.list(user.organizationId, query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'Get tenant by ID' })
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tenantsService.get(user.organizationId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Create tenant' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTenantDto) {
    return this.tenantsService.create(user.organizationId, dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'Update tenant' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTenantDto,
  ) {
    return this.tenantsService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Archive tenant' })
  archive(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.tenantsService.archive(user.organizationId, id);
  }
}
