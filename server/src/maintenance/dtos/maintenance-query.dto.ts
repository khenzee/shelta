import { IsIn, IsOptional, IsString } from 'class-validator';
import type {
  MaintenancePriority,
  MaintenanceStatus,
} from '../../generated/prisma/enums';

export class MaintenanceQueryDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'])
  status?: MaintenanceStatus;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: MaintenancePriority;
}
