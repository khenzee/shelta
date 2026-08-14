import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import type { Request } from 'express';
import type { JwtPayload } from './decorators/current-user.decorator';

interface LocalUser {
  id: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: Request, @Body() _loginDto: LoginDto) {
    return this.authService.login((req.user as LocalUser).id);
  }

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
    };
  }
}
