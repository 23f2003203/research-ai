import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createApp } from '../../src/app.js';
import { User } from '../../src/models/User.js';

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  app = createApp();
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Authentication API Integration Tests', () => {
  const testUser = {
    name: 'Dr. Evelyn Reed',
    email: 'evelyn.reed@research-ai.org',
    password: 'SecureResearchPassword123!',
    confirmPassword: 'SecureResearchPassword123!',
  };

  it('registers a new user and returns JWT cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user.passwordHash).toBeUndefined(); // Sensitive field omitted

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('token=');
  });

  it('prevents duplicate account registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('authenticates valid login and returns profile on /api/auth/me', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    const token = loginRes.body.token;

    // Call /api/auth/me with Bearer token
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe(testUser.email.toLowerCase());
    expect(meRes.body.user.name).toBe(testUser.name);
  });

  it('rejects access to /api/auth/me without valid token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
