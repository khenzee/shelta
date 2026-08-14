import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export type InspectionType = 'MOVE_IN' | 'MOVE_OUT' | 'PERIODIC' | 'COMPLAINT';

export class CreateInspectionDto {
  @IsString()
  propertyId: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsIn(['MOVE_IN', 'MOVE_OUT', 'PERIODIC', 'COMPLAINT'])
  type: InspectionType;

  @IsString()
  inspectorId: string;

  @IsDateString()
  scheduledDate: string;
}
