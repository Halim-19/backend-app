import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { registerUser, authHeader } from './helpers.js';

const createPost = (token, data = 'Hello world') =>
  request(app).post('/api/posts').set(authHeader(token)).send({ data });

describe('POST /api/posts', () => {
  it('requires a token', async () => {
    const res = await request(app).post('/api/posts').send({ data: 'hi' });
    expect(res.status).toBe(401);
  });

  it('creates a post owned by the logged-in user', async () => {
    const { token, user } = await registerUser();
    const res = await createPost(token);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ data: 'Hello world', authorId: user.id });
  });

  it('ignores an authorId sent in the body (no posting as someone else)', async () => {
    const alice = await registerUser();
    const bob = await registerUser();

    const res = await request(app)
      .post('/api/posts')
      .set(authHeader(alice.token))
      .send({ data: 'sneaky', authorId: bob.user.id });

    expect(res.status).toBe(201);
    expect(res.body.authorId).toBe(alice.user.id);
  });

  it('rejects empty and oversized posts', async () => {
    const { token } = await registerUser();

    expect((await createPost(token, '')).status).toBe(400);
    expect((await createPost(token, 'x'.repeat(1501))).status).toBe(400);
  });
});

describe('GET /api/posts/:id', () => {
  it('is public', async () => {
    const { token } = await registerUser();
    const { body: post } = await createPost(token);

    const res = await request(app).get(`/api/posts/${post.id}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(post.id);
  });

  it('returns 404 for a missing post', async () => {
    const res = await request(app).get('/api/posts/999999');
    expect(res.status).toBe(404);
  });

  it('returns 400 for an invalid id', async () => {
    const res = await request(app).get('/api/posts/abc');
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/posts/:id', () => {
  it('lets the owner update their post', async () => {
    const { token } = await registerUser();
    const { body: post } = await createPost(token);

    const res = await request(app)
      .patch(`/api/posts/${post.id}`)
      .set(authHeader(token))
      .send({ data: 'edited' });

    expect(res.status).toBe(200);
    expect(res.body.data).toBe('edited');
  });

  it("returns 403 when editing someone else's post, and leaves it unchanged", async () => {
    const owner = await registerUser();
    const intruder = await registerUser();
    const { body: post } = await createPost(owner.token, 'original');

    const res = await request(app)
      .patch(`/api/posts/${post.id}`)
      .set(authHeader(intruder.token))
      .send({ data: 'hacked' });

    expect(res.status).toBe(403);
    const stored = await prisma.post.findUnique({ where: { id: post.id } });
    expect(stored.data).toBe('original');
  });

  it('returns 401 without a token', async () => {
    const { token } = await registerUser();
    const { body: post } = await createPost(token);

    const res = await request(app).patch(`/api/posts/${post.id}`).send({ data: 'x' });
    expect(res.status).toBe(401);
  });

  it('returns 404 for a missing post', async () => {
    const { token } = await registerUser();
    const res = await request(app)
      .patch('/api/posts/999999')
      .set(authHeader(token))
      .send({ data: 'x' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/posts/:id', () => {
  it('lets the owner delete their post', async () => {
    const { token } = await registerUser();
    const { body: post } = await createPost(token);

    const res = await request(app).delete(`/api/posts/${post.id}`).set(authHeader(token));

    expect(res.status).toBe(204);
    expect(await prisma.post.findUnique({ where: { id: post.id } })).toBeNull();
  });

  it("returns 403 for someone else's post, and the post survives", async () => {
    const owner = await registerUser();
    const intruder = await registerUser();
    const { body: post } = await createPost(owner.token);

    const res = await request(app).delete(`/api/posts/${post.id}`).set(authHeader(intruder.token));

    expect(res.status).toBe(403);
    expect(await prisma.post.findUnique({ where: { id: post.id } })).not.toBeNull();
  });
});