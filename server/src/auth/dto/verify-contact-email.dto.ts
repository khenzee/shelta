import { IsIn, IsString } from 'class-validator';

export class VerifyContactEmailDto {
  @IsIn(['landlord', 'tenant'])
  type: 'landlord' | 'tenant';

  @IsString()
  token: string;
}
