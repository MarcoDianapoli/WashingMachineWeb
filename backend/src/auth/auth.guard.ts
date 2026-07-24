import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { SessionService } from 'src/session/session.service';
import { SKIP_AUTH_KEY } from './auth.decorator';
import { RequestWithUser, UserJwt } from './interface/request.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly sessionService: SessionService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const skipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token no ingresado');
    }

    let payload: UserJwt;
    try {
      payload = await this.jwtService.verifyAsync<UserJwt>(token);
    } catch {
      throw new UnauthorizedException('Token inválido');
    }

    if (!payload.sub || !Types.ObjectId.isValid(payload.sub) || !payload.jti) {
      throw new UnauthorizedException('Token inválido');
    }

    const sessionActive = await this.sessionService.isActive(
      payload.sub,
      payload.jti,
    );
    if (!sessionActive) {
      throw new UnauthorizedException('La sesión expiró o fue cerrada.');
    }

    // Minimal lookup so deactivations apply instantly (same pattern as BetOnFire's guard).
    const user = (await this.connection
      .collection('users')
      .findOne(
        { _id: new Types.ObjectId(payload.sub) },
        { projection: { isActive: 1 } },
      )) as { isActive?: boolean } | null;

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (user.isActive === false) {
      throw new ForbiddenException(
        'Tu cuenta está desactivada. Contacta al administrador.',
      );
    }

    request.user = {
      _id: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
    };

    return true;
  }
}
