import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ComplaintsService } from './services/complaints.service';
import { CreateComplaintDto } from './dtos/create-complaint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('complaints')
@Controller('complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'List complaints' })
  list(@CurrentUser() user: JwtPayload) {
    return this.complaintsService.list(user.organizationId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Get complaint by ID' })
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.complaintsService.get(user.organizationId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'FRONT_DESK')
  @ApiOperation({ summary: 'Create complaint' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateComplaintDto) {
    return this.complaintsService.create(user.organizationId, dto);
  }
}
