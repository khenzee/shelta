import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { LANDLORD_ONLY_KEY } from '../decorators/landlord.decorator';
import type { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class LandlordGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isLandlordOnly = this.reflector.getAllAndOverride<boolean>(
      LANDLORD_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isLandlordOnly) {
      return true;
    }

    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;

    if (!user || user.type !== 'LANDLORD' || !user.landlordId) {
      throw new ForbiddenException('Landlord access only');
    }

    return true;
  }
}
