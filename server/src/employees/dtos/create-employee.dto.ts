import { IsEmail, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name: string;

  @IsEmail()
  email: string;

  @IsUUID()
  roleId: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  jobTitle?: string;
}
