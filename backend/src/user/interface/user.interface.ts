import { Document, Types } from 'mongoose';

export const USER_ROLES = ['admin', 'washer', 'client'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: UserRole;
  specialty?: string;
  notes?: string;
  isActive: boolean;
  creationDate: Date;
}

/** User without sensitive fields, as returned by the API. */
export type SafeUser = Omit<User, 'password'>;
