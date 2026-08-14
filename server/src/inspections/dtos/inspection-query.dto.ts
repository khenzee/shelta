import { IsOptional, IsString } from 'class-validator';

export class InspectionQueryDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
