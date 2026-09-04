import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateMaintenanceDto {
  @IsOptional() @IsString() assignedToId?: string;
  @IsOptional() @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']) priority?: string;
  @IsOptional() @IsNumber() @Min(0) estimatedCost?: number;
  @IsOptional() @IsNumber() @Min(0) actualCost?: number;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() notes?: string;
}
