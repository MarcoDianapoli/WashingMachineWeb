import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser, SkipAuth } from './auth.decorator';
import { AuthService } from './auth.service';
import { LoginDTO, RegisterDTO } from './dto/auth.dto';
import type { RequestUser } from './interface/request.interface';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('/register')
  async register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @SkipAuth()
  @Post('/login')
  async login(@Body() dto: LoginDTO) {
    return this.authService.login(dto.email, dto.password);
  }

  @Post('/logout')
  async logout(@CurrentUser() user: RequestUser) {
    return this.authService.logout(user._id, user.jti);
  }

  @Post('/logout-all')
  async logoutAll(@CurrentUser('_id') userId: string) {
    return this.authService.logoutAll(userId);
  }

  @Get('/me')
  async me(@CurrentUser('_id') userId: string) {
    return this.authService.me(userId);
  }
}
