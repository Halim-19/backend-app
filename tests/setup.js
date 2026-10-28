import { afterAll, beforeAll, beforeEach } from 'vitest';
import { prisma } from '../src/config/db.js';
import { assertTestDatabase } from './guard.js';

beforeAll(() => assertTestDatabase());

// every test starts with empty tables
beforeEach(async () => {
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});