import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';
import { registerUser, seedPosts } from './helpers.js';

let author;

// 25 posts, so: 20 + 5 at the default size, 10 + 10 + 5 at limit=10
beforeEach(async () => {
  author = await registerUser();
  await seedPosts(author.user.id, 25);
});

const getPosts = (query = '') => request(app).get(`/api/posts${query}`);

describe('pagination', () => {
  it('returns defaults and a complete meta block', async () => {
    const res = await getPosts();

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(20);
    expect(res.body.meta).toEqual({
      page: 1,
      limit: 20,
      total: 25,
      totalPages: 2,
      hasNext: true,
      hasPrev: false,
    });
  });

  it('walks through pages correctly', async () => {
    const page2 = await getPosts('?page=2&limit=10');
    expect(page2.body.data).toHaveLength(10);
    expect(page2.body.meta).toMatchObject({ page: 2, hasNext: true, hasPrev: true });

    const page3 = await getPosts('?page=3&limit=10');
    expect(page3.body.data).toHaveLength(5);
    expect(page3.body.meta).toMatchObject({ hasNext: false, hasPrev: true });
  });

  it('never repeats or skips a post across pages', async () => {
    const ids = [];
    for (const page of [1, 2, 3]) {
      const res = await getPosts(`?page=${page}&limit=10`);
      ids.push(...res.body.data.map((p) => p.id));
    }
    expect(new Set(ids).size).toBe(25);
  });

  it('returns an empty list, not an error, past the last page', async () => {
    const res = await getPosts('?page=99');
    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
    expect(res.body.meta).toMatchObject({ total: 25, hasNext: false });
  });

  it.each(['?limit=1000', '?limit=0', '?page=0', '?page=abc'])(
    'rejects invalid parameters (%s) with 400',
    async (query) => {
      const res = await getPosts(query);
      expect(res.status).toBe(400);
    }
  );

  it('ignores unknown query parameters', async () => {
    const res = await getPosts('?foo=bar');
    expect(res.status).toBe(200);
  });
});

describe('sorting', () => {
  it('returns newest first by default', async () => {
    const res = await getPosts('?limit=25');
    const ids = res.body.data.map((p) => p.id);
    expect(ids).toEqual([...ids].sort((a, b) => b - a));
  });

  it('can sort ascending', async () => {
    const res = await getPosts('?limit=25&sortBy=id&order=asc');
    const ids = res.body.data.map((p) => p.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it('rejects a sort field outside the whitelist', async () => {
    const res = await getPosts('?sortBy=data');
    expect(res.status).toBe(400);
  });
});

describe('filtering', () => {
  it('filters by author', async () => {
    const other = await registerUser();
    await seedPosts(other.user.id, 3, 'Other');

    const res = await getPosts(`?authorId=${other.user.id}`);

    expect(res.body.meta.total).toBe(3);
    expect(res.body.data.every((p) => p.authorId === other.user.id)).toBe(true);
  });

  it('searches post text case-insensitively and counts only matches', async () => {
    await prisma.post.createMany({
      data: [
        { data: 'Hello World', authorId: author.user.id },
        { data: 'say HELLO again', authorId: author.user.id },
        { data: 'goodbye', authorId: author.user.id },
      ],
    });

    const res = await getPosts('?search=hello');

    expect(res.body.meta.total).toBe(2);
    expect(res.body.data).toHaveLength(2);
  });

  it('combines filters', async () => {
    const other = await registerUser();
    await seedPosts(other.user.id, 12, 'Combo');

    const res = await getPosts(`?authorId=${other.user.id}&limit=5&page=3`);

    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toMatchObject({ total: 12, totalPages: 3, hasNext: false });
  });
});