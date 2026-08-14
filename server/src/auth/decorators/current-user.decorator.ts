import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  type: 'AGENCY' | 'LANDLORD';
  organizationId: string;
  email: string;
  name: string;
  sessionId: string;
  role: string | null;
  landlordId: string | null;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user?: JwtPayload }>();
    if (!request.user) {
      throw new Error('Authenticated user is missing from the request');
    }
    return request.user;
  },
);
