import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user context');
    }

    const roleAliases: Record<string, string> = {
      SUPER_ADMIN: 'ADMIN',
      PROPERTY_MANAGER: 'MANAGER',
      ACCOUNTANT: 'MANAGER',
      MAINTENANCE_OFFICER: 'AGENT',
      FRONT_DESK: 'AGENT',
    };
    const userRole = roleAliases[user.role ?? ''] ?? user.role ?? '';
    const hasRole = requiredRoles.some(
      (requiredRole) => (roleAliases[requiredRole] ?? requiredRole) === userRole,
    );
    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
