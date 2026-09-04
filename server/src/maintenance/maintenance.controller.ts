import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './services/maintenance.service';
import { CreateMaintenanceDto } from './dtos/create-maintenance.dto';
import { UpdateMaintenanceStatusDto } from './dtos/update-maintenance-status.dto';
import { MaintenanceQueryDto } from './dtos/maintenance-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { UpdateMaintenanceDto } from './dtos/update-maintenance.dto';

@ApiTags('maintenance')
@Controller('maintenance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'List maintenance requests' })
  list(@CurrentUser() user: JwtPayload, @Query() query: MaintenanceQueryDto) {
    return this.maintenanceService.list(user.organizationId, query, query.page, query.limit);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'Get maintenance request by ID' })
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.maintenanceService.get(user.organizationId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK')
  @ApiOperation({ summary: 'Create maintenance request' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateMaintenanceDto) {
    return this.maintenanceService.create(user.organizationId, dto);
  }

  @Put(':id/status')
  @Roles('SUPER_ADMIN', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'Update maintenance status' })
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceStatusDto,
  ) {
    return this.maintenanceService.updateStatus(
      user.organizationId,
      id,
      dto,
      user.sub,
    );
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'Update maintenance request details' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateMaintenanceDto,
  ) {
    return this.maintenanceService.update(user.organizationId, id, dto);
  }
}
