import { IsIn, IsOptional, IsString } from 'class-validator';
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
}
