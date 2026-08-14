import { IsIn, IsOptional, IsString } from 'class-validator';
import type { CommunicationStatus } from '../../generated/prisma/enums';

export class CommunicationQueryDto {
  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsIn(['QUEUED', 'SENDING', 'SENT', 'FAILED'])
  status?: CommunicationStatus;
}
