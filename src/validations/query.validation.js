import { z } from 'zod';

// Reusable base: every list endpoint gets page and limit
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const postsQuerySchema = paginationSchema.extend({
  authorId: z.coerce.number().int().positive().optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(['id', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});

export const usersQuerySchema = paginationSchema.extend({
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(['id', 'name', 'createdAt']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
});