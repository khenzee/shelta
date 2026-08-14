import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateLeaseDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  paymentSchedule?: string;

  @IsOptional()
  @IsString()
  signedDocumentId?: string;
}
