import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { registerUser, authHeader, seedPosts } from './helpers.js';

describe('users are protected', () => {
  it('requires a token to list users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
  });

  it('never exposes password hashes in the list', async () => {
    const { token } = await registerUser();
    const res = await request(app).get('/api/users').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    for (const user of res.body.data) {
      expect(user).not.toHaveProperty('password');
    }
  });
});

describe('PATCH /api/users/:id', () => {
  it('lets a user update their own account', async () => {
    const { token, user } = await registerUser();

    const res = await request(app)
      .patch(`/api/users/${user.id}`)
      .set(authHeader(token))
      .send({ name: 'New Name' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body).not.toHaveProperty('password');
  });

  it("returns 403 when updating another user's account", async () => {
    const alice = await registerUser();
    const bob = await registerUser();

    const res = await request(app)
      .patch(`/api/users/${bob.user.id}`)
      .set(authHeader(alice.token))
      .send({ name: 'Hacked' });

    expect(res.status).toBe(403);
  });
});

describe('DELETE /api/users/:id', () => {
  it("returns 403 for another user's account", async () => {
    const alice = await registerUser();
    const bob = await registerUser();

    const res = await request(app).delete(`/api/users/${bob.user.id}`).set(authHeader(alice.token));
    expect(res.status).toBe(403);
  });

  it('deletes the account and its posts (cascade)', async () => {
    const { token, user } = await registerUser();
    await seedPosts(user.id, 3);

    const res = await request(app).delete(`/api/users/${user.id}`).set(authHeader(token));

    expect(res.status).toBe(204);
    expect(await prisma.post.count({ where: { authorId: user.id } })).toBe(0);
  });
});

describe('GET /api/users query handling', () => {
  it('rejects sorting by a field outside the whitelist', async () => {
    const { token } = await registerUser();
    const res = await request(app).get('/api/users?sortBy=password').set(authHeader(token));
    expect(res.status).toBe(400);
  });

  it('searches by name or email, case-insensitively', async () => {
    const { token } = await registerUser({ name: 'Unique Zebra', email: 'zebra@example.com' });
    await registerUser({ name: 'Someone Else', email: 'other@example.com' });

    const res = await request(app).get('/api/users?search=ZEBRA').set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(1);
    expect(res.body.data[0].email).toBe('zebra@example.com');
  });
});