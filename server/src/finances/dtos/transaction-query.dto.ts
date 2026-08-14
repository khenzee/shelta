import { IsIn, IsOptional, IsString } from 'class-validator';
import type { TransactionType } from '../../generated/prisma/enums';

export class TransactionQueryDto {
  @IsOptional()
  @IsString()
  landlordId?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsIn(['INCOME', 'EXPENSE'])
  type?: TransactionType;

  @IsOptional()
  @IsString()
  category?: string;
}
