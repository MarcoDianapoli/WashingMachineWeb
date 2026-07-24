import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import { AuthService, SESSION_TTL_SECONDS } from './auth.service';
import type { UserJwt } from './interface/request.interface';

describe('AuthService', () => {
  let service: AuthService;
  let userService: {
    findByEmailWithPassword: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
  };
  let passwordService: { comparePassword: jest.Mock };
  let jwtService: {
    signAsync: jest.Mock<Promise<string>, [UserJwt]>;
  };
  let sessionService: {
    create: jest.Mock;
    destroy: jest.Mock;
    destroyAll: jest.Mock;
  };

  const baseUser = {
    _id: new Types.ObjectId(),
    name: 'Admin',
    email: 'admin@monkey.com',
    phone: '',
    password: 'hash',
    role: 'admin',
    isActive: true,
  };

  beforeEach(() => {
    userService = {
      findByEmailWithPassword: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
    };
    passwordService = { comparePassword: jest.fn() };
    jwtService = {
      signAsync: jest
        .fn<Promise<string>, [UserJwt]>()
        .mockResolvedValue('jwt-token'),
    };
    sessionService = {
      create: jest.fn(),
      destroy: jest.fn(),
      destroyAll: jest.fn(),
    };

    service = new AuthService(
      userService as never,
      passwordService as never,
      jwtService as never,
      sessionService as never,
    );
  });

  describe('login', () => {
    it('returns token and user for valid credentials', async () => {
      userService.findByEmailWithPassword.mockResolvedValue(baseUser);
      passwordService.comparePassword.mockResolvedValue(true);

      const res = await service.login('admin@monkey.com', 'admin');

      expect(res.token).toBe('jwt-token');
      expect(res.user.email).toBe('admin@monkey.com');
      expect(res.user).not.toHaveProperty('password');
      expect(sessionService.create).toHaveBeenCalledWith(
        baseUser._id.toString(),
        expect.any(String),
        SESSION_TTL_SECONDS,
      );
      const signedPayload = jwtService.signAsync.mock.calls[0][0];
      expect(signedPayload.sub).toBe(baseUser._id.toString());
      expect(signedPayload.jti).toEqual(expect.any(String));
    });

    it('rejects an unknown user', async () => {
      userService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(service.login('nadie@x.com', 'pw')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
      expect(sessionService.create).not.toHaveBeenCalled();
    });

    it('rejects a wrong password', async () => {
      userService.findByEmailWithPassword.mockResolvedValue(baseUser);
      passwordService.comparePassword.mockResolvedValue(false);

      await expect(
        service.login('admin@monkey.com', 'mala'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects a deactivated account', async () => {
      userService.findByEmailWithPassword.mockResolvedValue({
        ...baseUser,
        isActive: false,
      });
      passwordService.comparePassword.mockResolvedValue(true);

      await expect(
        service.login('admin@monkey.com', 'admin'),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(sessionService.create).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('creates a client and auto-logs in', async () => {
      userService.create.mockResolvedValue({ ...baseUser, role: 'client' });

      const res = await service.register({
        name: 'Juan',
        email: 'juan@x.com',
        password: 'secreto123',
      });

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'juan@x.com' }),
        'client',
      );
      expect(res.user.role).toBe('client');
      expect(res.token).toBe('jwt-token');
    });
  });

  describe('logout', () => {
    it('destroys the given session', async () => {
      await service.logout('user-1', 'jti-1');
      expect(sessionService.destroy).toHaveBeenCalledWith('user-1', 'jti-1');
    });

    it('logoutAll destroys every session', async () => {
      await service.logoutAll('user-1');
      expect(sessionService.destroyAll).toHaveBeenCalledWith('user-1');
    });
  });
});
