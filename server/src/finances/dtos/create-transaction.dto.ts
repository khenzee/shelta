import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type PaymentMethod =
  'CASH' | 'BANK_TRANSFER' | 'CARD' | 'CHEQUE' | 'OTHER';

export class CreateTransactionDto {
  @IsIn(['INCOME', 'EXPENSE'])
  type: TransactionType;

  @IsString()
  category: string;

  @IsString()
  amount: string;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsIn(['CASH', 'BANK_TRANSFER', 'CARD', 'CHEQUE', 'OTHER'])
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  landlordId: string;

  @IsString()
  propertyId: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;
}
