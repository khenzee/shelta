import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateLeaseDto {
  @IsString()
  tenantId: string;

  @IsString()
  unitId: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  paymentSchedule: string;

  @IsOptional()
  @IsString()
  signedDocumentId?: string;
}
