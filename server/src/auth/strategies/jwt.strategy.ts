import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../config/environment';
import type { TokenPayload } from '../auth.service';
import { PrismaService } from '../../database/prisma.service';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService<EnvironmentVariables, true>,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
      algorithms: [config.get('JWT_ALGORITHM')],
    });
  }

  async validate(payload: TokenPayload): Promise<TokenPayload> {
    if (
      !payload.sessionId ||
      !payload.organizationId ||
      !['AGENCY', 'LANDLORD'].includes(payload.type)
    ) {
      throw new UnauthorizedException('Invalid access token');
    }

    const session = await this.prisma.session.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.sub,
        revokedAt: null,
        expiresAt: { gt: new Date() },
        user: {
          organizationId: payload.organizationId,
          status: 'ACTIVE',
        },
      },
    });

    if (!session) {
      throw new UnauthorizedException('Session is no longer active');
    }

    return payload;
  }
}
