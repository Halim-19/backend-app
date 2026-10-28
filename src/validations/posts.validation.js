import { z } from 'zod';

export const createPostSchema = z.object({
  data: z.string().min(1, 'Post cannot be empty').max(1500, 'Max is 1500 characters'),
  authorId: z.number().int().positive(),
});

// authors shouldn't change after creation, so leave authorId out of updates
export const updatePostSchema = createPostSchema.omit({ authorId: true }).partial();