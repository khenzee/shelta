import { IsString, Matches, MinLength } from 'class-validator';

export class AcceptInvitationDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(12)
  @Matches(/[A-Z]/, { message: 'password must contain an uppercase letter' })
  @Matches(/[a-z]/, { message: 'password must contain a lowercase letter' })
  @Matches(/\d/, { message: 'password must contain a number' })
  password: string;
}
