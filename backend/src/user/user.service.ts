import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PasswordService } from 'src/password/password.service';
import { CreateUserDTO, UpdateUserDTO } from './dto/user.dto';
import { User, UserRole } from './interface/user.interface';

const SAFE_PROJECTION = '-password';

@Injectable()
export class UserService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
  ) {}

  /** Creates the initial admin if none exists (ADMIN_EMAIL / ADMIN_PASSWORD). */
  async onApplicationBootstrap() {
    const adminExists = await this.userModel.exists({ role: 'admin' });
    if (adminExists) return;

    const email =
      this.configService.get<string>('ADMIN_EMAIL') ?? 'admin@monkey.com';
    const password =
      this.configService.get<string>('ADMIN_PASSWORD') ?? 'admin';

    await this.userModel.create({
      name: 'Administrador',
      email: email.toLowerCase(),
      password: await this.passwordService.hashPassword(password),
      role: 'admin',
    });
    this.logger.warn(
      `Initial admin created (${email}). Change the password in production.`,
    );
  }

  async create(dto: CreateUserDTO, forcedRole?: UserRole): Promise<User> {
    const email = dto.email.trim().toLowerCase();

    const exists = await this.userModel.findOne({ email });
    if (exists) {
      throw new BadRequestException('Ya existe un usuario con ese correo.');
    }

    const created = await this.userModel.create({
      ...dto,
      email,
      role: forcedRole ?? dto.role ?? 'client',
      password: await this.passwordService.hashPassword(dto.password),
    });

    return this.findById(created._id.toString());
  }

  async findAll(role?: UserRole): Promise<User[]> {
    const filter = role ? { role } : {};
    return this.userModel
      .find(filter, SAFE_PROJECTION)
      .sort({ creationDate: -1 });
  }

  async findById(id: string): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    const user = await this.userModel.findById(id, SAFE_PROJECTION);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return user;
  }

  /** Includes password — login flow only. */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userModel.findOne({ email: email.trim().toLowerCase() });
  }

  async update(id: string, dto: UpdateUserDTO): Promise<User> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const updates: Record<string, unknown> = { ...dto };

    if (dto.email) {
      const email = dto.email.trim().toLowerCase();
      const exists = await this.userModel.findOne({
        email,
        _id: { $ne: new Types.ObjectId(id) },
      });
      if (exists) {
        throw new BadRequestException('Ya existe un usuario con ese correo.');
      }
      updates.email = email;
    }

    if (dto.password) {
      updates.password = await this.passwordService.hashPassword(dto.password);
    }

    const user = await this.userModel.findByIdAndUpdate(id, updates, {
      returnDocument: 'after',
      projection: SAFE_PROJECTION,
    });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }
    return user;
  }

  /** Soft delete: keeps the record but blocks login. */
  async deactivate(id: string): Promise<User> {
    return this.update(id, { isActive: false });
  }
}
