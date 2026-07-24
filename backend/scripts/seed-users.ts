/**
 * Seeds one user per role: admin, client and washer.
 *
 * Plan mode (default, no writes):  pnpm db:seed:users
 * Apply mode (writes to Mongo):    pnpm db:seed:users:apply
 *
 * Existing emails are skipped, so it is safe to re-run. Credentials can be
 * overridden via env vars (see DEFAULT_USERS below).
 */
import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { UserSchema } from '../src/user/schema/user.schema';
import type { UserRole } from '../src/user/interface/user.interface';

const APPLY = process.argv.includes('--apply');

interface SeedUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  specialty?: string;
}

const DEFAULT_USERS: SeedUser[] = [
  {
    name: 'Administrador',
    email: process.env.ADMIN_EMAIL ?? 'admin@monkey.com',
    password: process.env.ADMIN_PASSWORD ?? 'admin',
    role: 'admin',
  },
  {
    name: 'Cliente Demo',
    email: process.env.SEED_CLIENT_EMAIL ?? 'cliente@monkey.com',
    password: process.env.SEED_CLIENT_PASSWORD ?? 'cliente123',
    role: 'client',
    phone: '5550000001',
  },
  {
    name: 'Lavador Demo',
    email: process.env.SEED_WASHER_EMAIL ?? 'lavador@monkey.com',
    password: process.env.SEED_WASHER_PASSWORD ?? 'lavador123',
    role: 'washer',
    phone: '5550000002',
    specialty: 'Lavado general',
  },
];

async function main() {
  const uri =
    process.env.MONGODB_URI ?? 'mongodb://localhost:27017/autolavado';

  console.log(`[seed] mode: ${APPLY ? 'APPLY' : 'PLAN (dry-run)'}`);
  await mongoose.connect(uri);
  console.log(`[seed] connected to database "${mongoose.connection.name}"`);

  const UserModel = mongoose.model('User', UserSchema);

  for (const user of DEFAULT_USERS) {
    const email = user.email.trim().toLowerCase();
    const existing = await UserModel.findOne({ email });

    if (existing) {
      console.log(`[skip] ${email} already exists (role: ${existing.role})`);
      continue;
    }

    if (!APPLY) {
      console.log(`[plan] would create ${email} (role: ${user.role})`);
      continue;
    }

    await UserModel.create({
      ...user,
      email,
      password: await bcrypt.hash(user.password, 10),
    });
    console.log(`[ok] created ${email} (role: ${user.role})`);
  }

  await mongoose.disconnect();
  if (!APPLY) {
    console.log('[seed] nothing written. Re-run with db:seed:users:apply');
  }
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exitCode = 1;
});
