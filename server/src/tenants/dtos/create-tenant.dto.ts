import { IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  firstName: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  lastName: string;

  @IsEmail()
  @MaxLength(120)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;

  @IsUUID()
  landlordId: string;

  @IsUUID()
  propertyId: string;

  @IsOptional()
  @IsUUID()
  unitId?: string;
}
