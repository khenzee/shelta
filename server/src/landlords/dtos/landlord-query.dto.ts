import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { LandlordStatus } from '../../generated/prisma/enums';

export class LandlordQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'SUSPENDED', 'ARCHIVED'])
  status?: LandlordStatus;
}
