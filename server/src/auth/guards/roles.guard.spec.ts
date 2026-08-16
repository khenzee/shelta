import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import type { JwtPayload } from '../decorators/current-user.decorator';

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const guard = new RolesGuard(reflector);

  function context(user?: JwtPayload) {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    } as unknown as ExecutionContext;
  }

  it('allows a matching canonical role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(
      guard.canActivate(
        context({
          sub: 'user-1',
          type: 'AGENCY',
          organizationId: 'org-1',
          email: 'admin@example.com',
          name: 'Admin',
          sessionId: 'session-1',
          role: 'ADMIN',
          landlordId: null,
        }),
      ),
    ).toBe(true);
  });

  it('rejects a missing or non-matching role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['ADMIN']);
    expect(() =>
      guard.canActivate(
        context({
          sub: 'user-1',
          type: 'AGENCY',
          organizationId: 'org-1',
          email: 'admin@example.com',
          name: 'Admin',
          sessionId: 'session-1',
          role: 'PROPERTY_MANAGER',
          landlordId: null,
        }),
      ),
    ).toThrow(ForbiddenException);
  });
});
