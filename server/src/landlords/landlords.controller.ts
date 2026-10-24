import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateLandlordDto } from './dtos/create-landlord.dto';
import { LandlordQueryDto } from './dtos/landlord-query.dto';
import { UpdateLandlordDto } from './dtos/update-landlord.dto';
import { LandlordsService } from './services/landlords.service';

@ApiTags('landlords')
@Controller('landlords')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LandlordsController {
  constructor(private readonly landlordsService: LandlordsService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'List landlords' })
  list(@CurrentUser() user: JwtPayload, @Query() query: LandlordQueryDto) {
    return this.landlordsService.list(
      user.organizationId,
      query,
      query.page,
      query.limit,
    );
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Get landlord by ID' })
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.landlordsService.get(user.organizationId, id);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Create landlord' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateLandlordDto) {
    return this.landlordsService.create(user.organizationId, dto);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Update landlord' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateLandlordDto,
  ) {
    return this.landlordsService.update(user.organizationId, id, dto);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Archive landlord' })
  archive(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.landlordsService.archive(user.organizationId, id);
  }
}
