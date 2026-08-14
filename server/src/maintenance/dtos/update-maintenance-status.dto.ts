import { IsIn, IsOptional, IsString } from 'class-validator';

export type MaintenanceStatus =
  'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED';

export class UpdateMaintenanceStatusDto {
  @IsIn(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED'])
  status: MaintenanceStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
