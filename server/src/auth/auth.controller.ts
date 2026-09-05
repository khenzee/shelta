import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AcceptInvitationDto } from './dto/accept-invitation.dto';
import { VerifyContactEmailDto } from './dto/verify-contact-email.dto';
import type { Request } from 'express';
import type { JwtPayload } from './decorators/current-user.decorator';

interface LocalUser {
  id: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ auth: { ttl: 60_000, limit: 20 } })
  @Get('invitations')
  validateInvitation(@Req() req: Request) {
    const token = String(req.query.token || '');
    return this.authService.validateInvitation(token);
  }

  @Throttle({ auth: { ttl: 60_000, limit: 10 } })
  @Post('invitations/accept')
  acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(dto.token, dto.password);
  }

  @Throttle({ auth: { ttl: 60_000, limit: 20 } })
  @Post('contacts/verify-email')
  verifyContactEmail(@Body() dto: VerifyContactEmailDto) {
    return this.authService.verifyContactEmail(dto.type, dto.token);
  }

  @Throttle({ auth: { ttl: 60_000, limit: 10 } })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Body() _loginDto: LoginDto) {
    return this.authService.login((req.user as LocalUser).id);
  }

  @Throttle({ auth: { ttl: 60_000, limit: 20 } })
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    const user = req.user as JwtPayload;
    await this.authService.logout(user.sessionId, user.sub);
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Req() req: Request) {
    await this.authService.logoutAll((req.user as JwtPayload).sub);
    return { message: 'All sessions revoked' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('session')
  session(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      type: user.type,
      role: user.role,
    };
  }
}
