import { UserRole } from 'src/user/interface/user.interface';

export interface AuthUserResponse {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: AuthUserResponse;
}
