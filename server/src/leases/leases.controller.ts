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
import { LeasesService } from './services/leases.service';
import { CreateLeaseDto } from './dtos/create-lease.dto';
import { UpdateLeaseDto } from './dtos/update-lease.dto';
import { LeaseQueryDto } from './dtos/lease-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('leases')
@Controller('leases')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'List leases' })
  list(@CurrentUser() user: JwtPayload, @Query() query: LeaseQueryDto) {
    return this.leasesService.list(user.organizationId, query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Get lease by ID' })
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.leasesService.get(user.organizationId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Create lease' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLeaseDto) {
    return this.leasesService.create(user.organizationId, dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Update lease' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateLeaseDto,
  ) {
    return this.leasesService.update(user.organizationId, id, dto);
  }
}
