import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { LeaseStatus } from '../../generated/prisma/enums';

export class LeaseQueryDto {
  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE', 'EXPIRING', 'TERMINATED', 'EXPIRED', 'RENEWED'])
  status?: LeaseStatus;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
