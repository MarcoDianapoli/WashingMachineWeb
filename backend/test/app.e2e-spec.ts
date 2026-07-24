import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from 'src/app.module';
import type { AuthResponse } from 'src/auth/interface/response.interface';

interface UserBody {
  _id: string;
  email: string;
  role: string;
  password?: string;
}

/**
 * Full auth-flow e2e.
 * Mongo: in-memory instance. Redis: real local instance (db 15).
 */
describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let mongod: MongoMemoryServer;
  let adminToken: string;
  let clientToken: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    process.env.MONGODB_URI = mongod.getUri('autolavado-test');
    process.env.REDIS_URL = 'redis://localhost:6379/15';
    process.env.SECRET_KEY = 'secret-de-test';
    process.env.ADMIN_EMAIL = 'admin@monkey.com';
    process.env.ADMIN_PASSWORD = 'admin';

    // process.env takes precedence over .env and the factories run on init,
    // so these values reach Mongoose/Redis/Jwt.
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  }, 120000);

  afterAll(async () => {
    await app?.close();
    await mongod?.stop();
  });

  it('rejects login with bad credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@monkey.com', password: 'mala' })
      .expect(401);
  });

  it('seed admin login returns a token', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@monkey.com', password: 'admin' })
      .expect(201);

    const body = res.body as AuthResponse;
    expect(body.token).toBeDefined();
    expect(body.user.role).toBe('admin');
    expect(body.user).not.toHaveProperty('password');
    adminToken = body.token;
  });

  it('GET /auth/me returns the profile', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = res.body as UserBody;
    expect(body.email).toBe('admin@monkey.com');
    expect(body.password).toBeUndefined();
  });

  it('rejects requests without a token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('registers a client and auto-logs in', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'secreto123',
        phone: '5551234567',
      })
      .expect(201);

    const body = res.body as AuthResponse;
    expect(body.user.role).toBe('client');
    clientToken = body.token;
  });

  it('validates the register body', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ name: '', email: 'no-es-email', password: '123' })
      .expect(400);
  });

  it('a client cannot list users', async () => {
    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(403);
  });

  it('the admin lists users and creates a washer', async () => {
    const list = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
    expect((list.body as UserBody[]).length).toBeGreaterThanOrEqual(2);

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Carlos Rodríguez',
        email: 'carlos@monkey.com',
        password: 'secreto123',
        role: 'washer',
        specialty: 'Lavado de Interiores',
      })
      .expect(201);
    const washer = res.body as UserBody;
    expect(washer.role).toBe('washer');
    expect(washer.password).toBeUndefined();
  });

  it('logout invalidates the Redis session', async () => {
    await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(201);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${clientToken}`)
      .expect(401);
  });

  it('blocks NoSQL injection in the login body', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: { $gt: '' }, password: { $gt: '' } })
      .expect(400);
  });

  it('blocks NoSQL injection in the register body', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: { $gt: '' },
        email: 'inyeccion@example.com',
        password: 'secreto123',
      })
      .expect(400);
  });

  it('ignores NoSQL operators in /users query params', async () => {
    // Express 5 ("simple" parser) never turns role[$ne] into a nested object:
    // it stays a literal key that the DTO whitelist drops. The malicious
    // query behaves the same as sending no filter at all.
    const all = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const injected = await request(app.getHttpServer())
      .get('/users?role[$ne]=client')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect((injected.body as UserBody[]).length).toBe(
      (all.body as UserBody[]).length,
    );

    // A role value outside the enum is rejected.
    await request(app.getHttpServer())
      .get('/users?role=hacker')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(400);
  });

  it('deactivating a user blocks their access', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'juan@example.com', password: 'secreto123' })
      .expect(201);
    const body = login.body as AuthResponse;
    const token = body.token;
    const userId = body.user._id;

    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'juan@example.com', password: 'secreto123' })
      .expect(403);
  });
});
