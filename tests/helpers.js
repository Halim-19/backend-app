import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';

let counter = 0;

// Register a fresh user and return their credentials, token, and user record
export const registerUser = async (overrides = {}) => {
  counter += 1;
  const credentials = {
    name: 'Test User',
    email: `user${counter}@example.com`,
    password: 'supersecret1',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(credentials);
  return { ...credentials, token: res.body.token, user: res.body.user, res };
};

export const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

// Insert posts directly in the database (much faster than going through HTTP)
export const seedPosts = (authorId, count, label = 'Sample') =>
  prisma.post.createMany({
    data: Array.from({ length: count }, (_, i) => ({
      data: `${label} post ${i + 1}`,
      authorId,
    })),
  });