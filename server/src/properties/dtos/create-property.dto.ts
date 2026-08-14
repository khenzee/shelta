import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsString()
  type: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  state?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @IsString()
  landlordId: string;
}
