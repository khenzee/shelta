import { IsIn, IsOptional, IsString } from 'class-validator';

export type MaintenanceCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HVAC'
  | 'STRUCTURAL'
  | 'APPLIANCE'
  | 'CLEANING'
  | 'SECURITY'
  | 'OTHER';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export class CreateMaintenanceDto {
  @IsString()
  propertyId: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsIn([
    'PLUMBING',
    'ELECTRICAL',
    'HVAC',
    'STRUCTURAL',
    'APPLIANCE',
    'CLEANING',
    'SECURITY',
    'OTHER',
  ])
  category: MaintenanceCategory;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: MaintenancePriority;
}
