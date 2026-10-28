import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { registerUser, authHeader } from './helpers.js';

describe('POST /api/auth/register', () => {
  it('creates a user and returns a token without the password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Amina', email: 'amina@example.com', password: 'supersecret1' });

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ name: 'Amina', email: 'amina@example.com' });
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('stores a bcrypt hash, never the plain password', async () => {
    await registerUser({ email: 'hash@example.com' });

    const stored = await prisma.user.findUnique({
      where: { email: 'hash@example.com' },
      omit: { password: false },
    });

    expect(stored.password).not.toBe('supersecret1');
    expect(stored.password).toMatch(/^\$2[aby]\$/); // bcrypt format
  });

  it('returns 409 for a duplicate email', async () => {
    await registerUser({ email: 'dup@example.com' });
    const second = await registerUser({ email: 'dup@example.com' });
    expect(second.res.status).toBe(409);
  });

  it('returns 400 for a short password', async () => {
    const { res } = await registerUser({ password: 'short' });
    expect(res.status).toBe(400);
  });

  it('returns 400 for an invalid email', async () => {
    const { res } = await registerUser({ email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for correct credentials', async () => {
    const { email, password } = await registerUser();

    const res = await request(app).post('/api/auth/login').send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 401 for a wrong password', async () => {
    const { email } = await registerUser();
    const res = await request(app).post('/api/auth/login').send({ email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('gives the same error for an unknown email as for a wrong password', async () => {
    const { email } = await registerUser();

    const wrongPassword = await request(app).post('/api/auth/login').send({ email, password: 'wrongpassword' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrongpassword' });

    expect(unknownEmail.status).toBe(401);
    expect(unknownEmail.body.message).toBe(wrongPassword.body.message);
  });
});

describe('GET /api/auth/me', () => {
  it('returns the logged-in user', async () => {
    const { token, email } = await registerUser();
    const res = await request(app).get('/api/auth/me').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.email).toBe(email);
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns 401 for a garbage token', async () => {
    const res = await request(app).get('/api/auth/me').set(authHeader('not.a.real.token'));
    expect(res.status).toBe(401);
  });

  it('returns 401 when the user no longer exists', async () => {
    const { token, user } = await registerUser();
    await prisma.user.delete({ where: { id: user.id } });

    const res = await request(app).get('/api/auth/me').set(authHeader(token));
    expect(res.status).toBe(401);
  });
});