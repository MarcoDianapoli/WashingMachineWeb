import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { USER_ROLES } from '../interface/user.interface';
import type { UserRole } from '../interface/user.interface';

export class CreateUserDTO {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(USER_ROLES, { message: 'Rol inválido' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class FindUsersQueryDTO {
  @IsOptional()
  @IsIn(USER_ROLES, { message: 'Rol inválido' })
  role?: UserRole;
}

export class UpdateUserDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
  name?: string;

  @IsOptional()
  @IsEmail({}, { message: 'El correo no es válido' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(USER_ROLES, { message: 'Rol inválido' })
  role?: UserRole;

  @IsOptional()
  @IsString()
  specialty?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
