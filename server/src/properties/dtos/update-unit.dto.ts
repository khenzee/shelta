import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateUnitDto {
  @IsOptional() @IsString() @MaxLength(40) number?: string;
  @IsOptional() @IsString() @MaxLength(40) floor?: string;
  @IsOptional() @IsString() @MaxLength(80) type?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) bedrooms?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) bathrooms?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) monthlyRent?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) securityDeposit?: number;
}
