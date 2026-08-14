import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InspectionsService } from './services/inspections.service';
import { CreateInspectionDto } from './dtos/create-inspection.dto';
import { InspectionQueryDto } from './dtos/inspection-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('inspections')
@Controller('inspections')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'List inspections' })
  list(@CurrentUser() user: JwtPayload, @Query() query: InspectionQueryDto) {
    return this.inspectionsService.list(user.organizationId, query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Get inspection by ID' })
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.inspectionsService.get(user.organizationId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Create inspection' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateInspectionDto) {
    return this.inspectionsService.create(user.organizationId, dto);
  }
}
