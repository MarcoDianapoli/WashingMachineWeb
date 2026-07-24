import { Schema, Types } from 'mongoose';
import { USER_ROLES } from '../interface/user.interface';

export const UserSchema = new Schema({
  _id: { type: Types.ObjectId, required: true, auto: true },
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true },
  phone: { type: String, required: false, default: '' },
  role: {
    type: String,
    enum: USER_ROLES,
    default: 'client',
  },
  // Washer-specific fields (mirrors the frontend Lavador type in types.ts)
  specialty: { type: String, required: false },
  notes: { type: String, required: false },
  isActive: { type: Boolean, default: true },
  creationDate: { type: Date, default: Date.now },
});
