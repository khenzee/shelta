import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UnitQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;
}
