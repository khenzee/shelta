import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LandlordGuard } from './landlord.guard';
import type { JwtPayload } from '../decorators/current-user.decorator';

describe('LandlordGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const guard = new LandlordGuard(reflector);

  function context(user?: JwtPayload) {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
  });

  it('requires both landlord type and landlord id', () => {
    expect(
      guard.canActivate(
        context({
          sub: 'user-1',
          type: 'LANDLORD',
          organizationId: 'org-1',
          email: 'owner@example.com',
          name: 'Owner',
          sessionId: 'session-1',
          role: null,
          landlordId: 'landlord-1',
        }),
      ),
    ).toBe(true);
  });

  it('rejects agency users', () => {
    expect(() =>
      guard.canActivate(
        context({
          sub: 'user-1',
          type: 'AGENCY',
          organizationId: 'org-1',
          email: 'admin@example.com',
          name: 'Admin',
          sessionId: 'session-1',
          role: 'SUPER_ADMIN',
          landlordId: null,
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
