import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { PasswordService } from 'src/password/password.service';
import { SessionService } from 'src/session/session.service';
import { User } from 'src/user/interface/user.interface';
import { UserService } from 'src/user/user.service';
import { RegisterDTO } from './dto/auth.dto';
import { UserJwt } from './interface/request.interface';
import { AuthResponse, AuthUserResponse } from './interface/response.interface';

/** Must match the expiresIn configured in AuthModule (7 days). */
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService,
    private readonly sessionService: SessionService,
  ) {}

  private toAuthUser(user: User): AuthUserResponse {
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }

  private async buildLoginResponse(user: User): Promise<AuthResponse> {
    const jti = randomUUID();
    const payload: UserJwt = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      jti,
    };

    const token = await this.jwtService.signAsync(payload);
    await this.sessionService.create(
      user._id.toString(),
      jti,
      SESSION_TTL_SECONDS,
    );

    return { token, user: this.toAuthUser(user) };
  }

  async register(dto: RegisterDTO): Promise<AuthResponse> {
    const user = await this.userService.create(dto, 'client');
    return this.buildLoginResponse(user);
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.userService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    const validPassword = await this.passwordService.comparePassword(
      password,
      user.password,
    );
    if (!validPassword) {
      throw new UnauthorizedException('Credenciales incorrectas.');
    }

    if (!user.isActive) {
      throw new ForbiddenException(
        'Tu cuenta está desactivada. Contacta al administrador.',
      );
    }

    return this.buildLoginResponse(user);
  }

  async logout(userId: string, jti: string): Promise<{ message: string }> {
    await this.sessionService.destroy(userId, jti);
    return { message: 'Sesión cerrada.' };
  }

  async logoutAll(userId: string): Promise<{ message: string }> {
    await this.sessionService.destroyAll(userId);
    return { message: 'Todas las sesiones fueron cerradas.' };
  }

  async me(userId: string): Promise<User> {
    return this.userService.findById(userId);
  }
}
