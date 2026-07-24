import {
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { UserRole } from 'src/user/interface/user.interface';
import { RequestUser, RequestWithUser } from './interface/request.interface';

export const SKIP_AUTH_KEY = 'skipAuth';
/** Marks an endpoint as public (no token required). */
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);

export const ROLES_KEY = 'roles';
/** Restricts an endpoint or controller to the given roles. */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

/** Injects the token's user (or one of its properties) into the handler. */
export const CurrentUser = createParamDecorator(
  (data: keyof RequestUser | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = req.user;
    if (!user) return null;
    if (!data) return user;
    return user[data] ?? null;
  },
);
