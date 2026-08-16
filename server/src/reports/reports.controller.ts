import {
  Controller,
  Get,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './services/reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { IsDateString, IsNotEmpty } from 'class-validator';

class FinancialReportQueryDto {
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('occupancy')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Get occupancy report' })
  getOccupancyReport(@CurrentUser() user: JwtPayload) {
    return this.reportsService.getOccupancyReport(user.organizationId);
  }

  @Get('financial')
  @Roles('SUPER_ADMIN')
  @ApiOperation({ summary: 'Get financial report' })
  getFinancialReport(
    @CurrentUser() user: JwtPayload,
    @Query() query: FinancialReportQueryDto,
  ) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    if (endDate < startDate) {
      throw new BadRequestException('End date must be on or after start date');
    }
    return this.reportsService.getFinancialReport(
      user.organizationId,
      startDate,
      endDate,
    );
  }
}
