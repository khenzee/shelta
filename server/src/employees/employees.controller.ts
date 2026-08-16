import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeesService } from './services/employees.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/decorators/current-user.decorator';
import { CreateEmployeeDto } from './dtos/create-employee.dto';

@ApiTags('employees')
@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post('invitations')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Invite an employee' })
  invite(@CurrentUser() user: JwtPayload, @Body() dto: CreateEmployeeDto) {
    return this.employeesService.invite(user.organizationId, user.sub, dto);
  }

  @Get('roles/options')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'List employee role options' })
  listRoles(@CurrentUser() user: JwtPayload) {
    return this.employeesService.listRoles(user.organizationId);
  }

  @Get()
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'List employees' })
  list(@CurrentUser() user: JwtPayload) {
    return this.employeesService.list(user.organizationId);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'PROPERTY_MANAGER')
  @ApiOperation({ summary: 'Get employee by ID' })
  get(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.employeesService.get(user.organizationId, id);
  }
}
