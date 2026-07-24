import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Roles } from 'src/auth/auth.decorator';
import { SessionService } from 'src/session/session.service';
import {
  CreateUserDTO,
  FindUsersQueryDTO,
  UpdateUserDTO,
} from './dto/user.dto';
import { UserService } from './user.service';

@Roles('admin')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  async findAll(@Query() query: FindUsersQueryDTO) {
    return this.userService.findAll(query.role);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateUserDTO) {
    return this.userService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDTO) {
    const user = await this.userService.update(id, dto);
    // If the user was deactivated or the password changed, kill their sessions.
    if (dto.isActive === false || dto.password) {
      await this.sessionService.destroyAll(id);
    }
    return user;
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    const user = await this.userService.deactivate(id);
    await this.sessionService.destroyAll(id);
    return user;
  }
}
