import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { EnvironmentVariables } from '../config/environment';
import { createHash, randomUUID } from 'node:crypto';

export interface TokenPayload {
  sub: string;
  type: 'AGENCY' | 'LANDLORD';
  organizationId: string;
  email: string;
  name: string;
  sessionId: string;
  role: string | null;
  landlordId: string | null;
}

interface RefreshTokenPayload {
  sub: string;
  type: 'refresh';
  sessionId: string;
}

function normalizeRoleName(name: string | null | undefined) {
  return (
    name
      ?.trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_') ?? null
  );
}

function durationToMilliseconds(value: string) {
  const match = /^(\d+)(s|m|h|d)$/.exec(value);
  if (!match) {
    throw new Error(`Unsupported token expiry format: ${value}`);
  }

  const amount = Number(match[1]);
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return amount * multipliers[match[2] as keyof typeof multipliers];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService<EnvironmentVariables, true>,
  ) {}

  async validateUser(email: string, password: string, organizationId?: string) {
    const users = await this.prisma.user.findMany({
      where: {
        email: { equals: email, mode: 'insensitive' },
        status: 'ACTIVE',
        ...(organizationId ? { organizationId } : {}),
      },
      include: { employee: { include: { role: true } }, landlord: true },
      take: 2,
    });

    if (users.length !== 1) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = users[0];
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, status: 'ACTIVE' },
      include: { employee: { include: { role: true } }, landlord: true },
    });

    if (!user) {
      throw new UnauthorizedException('User is not active');
    }

    const sessionId = randomUUID();
    const accessPayload: TokenPayload = {
      sub: user.id,
      type: user.type,
      organizationId: user.organizationId,
      email: user.email,
      name: user.name,
      sessionId,
      role: normalizeRoleName(user.employee?.role.name),
      landlordId: user.landlord?.id ?? null,
    };

    const accessToken = await this.jwt.signAsync(accessPayload);
    const refreshToken = await this.jwt.signAsync(
      {
        sub: user.id,
        type: 'refresh',
        sessionId,
      } satisfies RefreshTokenPayload,
      {
        expiresIn: this.config.get('JWT_REFRESH_TOKEN_EXPIRY', { infer: true }),
      },
    );

    const tokenHash = await bcrypt.hash(refreshToken, 10);
    const session = await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        tokenHash,
        expiresAt: new Date(
          Date.now() +
            durationToMilliseconds(
              this.config.get('JWT_REFRESH_TOKEN_EXPIRY', { infer: true }),
            ),
        ),
      },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      sessionId: session.id,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        type: user.type,
        employee: user.employee
          ? {
              id: user.employee.id,
              role: user.employee.role.name,
              department: user.employee.department,
              jobTitle: user.employee.jobTitle,
            }
          : null,
        landlord: user.landlord
          ? { id: user.landlord.id, code: user.landlord.code }
          : null,
      },
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload =
        await this.jwt.verifyAsync<RefreshTokenPayload>(refreshToken);
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException();
      }

      const session = await this.prisma.session.findFirst({
        where: {
          id: payload.sessionId,
          userId: payload.sub,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (
        !session ||
        !(await bcrypt.compare(refreshToken, session.tokenHash))
      ) {
        throw new UnauthorizedException();
      }

      const revoked = await this.prisma.session.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (revoked.count !== 1) {
        throw new UnauthorizedException();
      }

      return this.login(payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(sessionId: string, userId: string) {
    await this.prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });
  }

  async logoutAll(userId: string) {
    await this.prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async validateInvitation(token: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        tokenHash,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
        user: { status: 'INVITED' },
      },
      include: { user: { include: { employee: { include: { role: true } } } } },
    });
    if (!invitation) throw new UnauthorizedException('Invitation is invalid or expired');
    return {
      email: invitation.user.email,
      name: invitation.user.name,
      role: invitation.user.employee?.role.name ?? null,
      expiresAt: invitation.expiresAt,
    };
  }

  async acceptInvitation(token: string, password: string) {
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const invitation = await this.prisma.invitation.findFirst({
      where: {
        tokenHash,
        acceptedAt: null,
        expiresAt: { gt: new Date() },
        user: { status: 'INVITED' },
      },
      include: { user: { include: { employee: true } } },
    });
    if (!invitation) throw new UnauthorizedException('Invitation is invalid or expired');

    const passwordHash = await bcrypt.hash(password, 12);
    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: invitation.userId },
        data: {
          passwordHash,
          status: 'ACTIVE',
          emailVerifiedAt: new Date(),
          passwordChangedAt: new Date(),
        },
      });
      if (invitation.user.employee) {
        await tx.employee.update({
          where: { id: invitation.user.employee.id },
          data: { status: 'ACTIVE' },
        });
      }
      await tx.invitation.updateMany({
        where: { userId: invitation.userId, acceptedAt: null },
        data: { acceptedAt: new Date() },
      });
    });
    return { message: 'Invitation accepted' };
  }

  async verifyContactEmail(type: 'landlord' | 'tenant', token: string) {
    const emailVerifyHash = createHash('sha256').update(token).digest('hex');
    const now = new Date();

    if (type === 'landlord') {
      const landlord = await this.prisma.landlord.findFirst({
        where: {
          emailVerifyHash,
          emailVerifyExpiry: { gt: now },
          emailVerifiedAt: null,
        },
      });
      if (!landlord) throw new UnauthorizedException('Verification link is invalid or expired');
      await this.prisma.landlord.update({
        where: { id: landlord.id },
        data: { emailVerifiedAt: now, emailVerifyHash: null, emailVerifyExpiry: null },
      });
    } else {
      const tenant = await this.prisma.tenant.findFirst({
        where: { emailVerifyHash, emailVerifyExpiry: { gt: now }, emailVerifiedAt: null },
      });
      if (!tenant) throw new UnauthorizedException('Verification link is invalid or expired');
      await this.prisma.tenant.update({
        where: { id: tenant.id },
        data: { emailVerifiedAt: now, emailVerifyHash: null, emailVerifyExpiry: null },
      });
    }

    return { message: 'Email verified' };
  }
}
