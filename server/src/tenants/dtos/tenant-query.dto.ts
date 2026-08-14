import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { TenantStatus } from '../../generated/prisma/enums';

export class TenantQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  landlordId?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'FORMER', 'NOTICE_GIVEN', 'ARCHIVED'])
  status?: TenantStatus;
}
