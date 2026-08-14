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
import { FinancesService } from './services/finances.service';
import { CreateTransactionDto } from './dtos/create-transaction.dto';
import { TransactionQueryDto } from './dtos/transaction-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';

@ApiTags('finances')
@Controller('finances')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER', 'ACCOUNTANT')
  @ApiOperation({ summary: 'List transactions' })
  list(@CurrentUser() user: JwtPayload, @Query() query: TransactionQueryDto) {
    return this.financesService.list(user.organizationId, query);
  }

  @Post()
  @Roles('SUPER_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Create transaction' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateTransactionDto) {
    return this.financesService.create(user.organizationId, dto, user.sub);
  }

  @Put(':id/void')
  @Roles('SUPER_ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Void transaction' })
  void(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.financesService.void(user.organizationId, id, user.sub);
  }
}
