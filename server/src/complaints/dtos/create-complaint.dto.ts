import { IsOptional, IsString } from 'class-validator';

export type ComplaintCategory =
  | 'PLUMBING'
  | 'ELECTRICAL'
  | 'HVAC'
  | 'STRUCTURAL'
  | 'APPLIANCE'
  | 'CLEANING'
  | 'SECURITY'
  | 'OTHER';

export class CreateComplaintDto {
  @IsString()
  propertyId: string;

  @IsOptional()
  @IsString()
  unitId?: string;

  @IsOptional()
  @IsString()
  tenantId?: string;

  @IsString()
  category: string;

  @IsString()
  title: string;

  @IsString()
  description: string;
}
