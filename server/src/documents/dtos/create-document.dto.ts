import { IsOptional, IsString } from 'class-validator';

export type DocumentStatus = 'ACTIVE' | 'ARCHIVED';

export class CreateDocumentDto {
  @IsString()
  category: string;

  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  landlordId?: string;

  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsOptional()
  @IsString()
  leaseId?: string;

  @IsOptional()
  @IsString()
  maintenanceId?: string;
}
