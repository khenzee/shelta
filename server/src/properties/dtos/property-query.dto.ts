import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { PropertyStatus } from '../../generated/prisma/enums';

export class PropertyQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsString()
  landlordId?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'VACANT', 'UNDER_MAINTENANCE', 'SOLD', 'ARCHIVED'])
  status?: PropertyStatus;
}
