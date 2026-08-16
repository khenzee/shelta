import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateUnitDto {
  @IsUUID()
  propertyId: string;

  @IsString()
  @MaxLength(40)
  number: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  floor?: string;

  @IsString()
  @MaxLength(80)
  type: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  bedrooms: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  bathrooms: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  monthlyRent: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  securityDeposit: number;
}
