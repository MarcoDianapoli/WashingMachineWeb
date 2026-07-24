import { Request } from 'express';
import { UserRole } from 'src/user/interface/user.interface';

/** Payload signed into the JWT. */
export interface UserJwt {
  sub: string;
  email: string;
  role: UserRole;
  jti: string;
}

/** User attached to the request by the AuthGuard. */
export interface RequestUser {
  _id: string;
  email: string;
  role: UserRole;
  jti: string;
}

export interface RequestWithUser extends Request {
  user: RequestUser;
}
