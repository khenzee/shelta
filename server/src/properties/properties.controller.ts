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
import { PropertiesService } from './services/properties.service';
import { CreatePropertyDto } from './dtos/create-property.dto';
import { UpdatePropertyDto } from './dtos/update-property.dto';
import { PropertyQueryDto } from './dtos/property-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('properties')
@Controller('properties')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'List properties' })
  list(@CurrentUser() user: JwtPayload, @Query() query: PropertyQueryDto) {
    return this.propertiesService.list(user.organizationId, query);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'MAINTENANCE_OFFICER')
  @ApiOperation({ summary: 'Get property by ID' })
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.propertiesService.get(user.organizationId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Create property' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreatePropertyDto) {
    return this.propertiesService.create(user.organizationId, dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Update property' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
  ) {
    return this.propertiesService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Archive property' })
  archive(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.propertiesService.archive(user.organizationId, id);
  }
}
