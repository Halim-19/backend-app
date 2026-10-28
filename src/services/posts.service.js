import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const postsService = {
  getAll: (authorId) =>
    prisma.post.findMany({
      where: authorId ? { authorId } : undefined,
      orderBy: { id: 'asc' },
    }),

  getById: async (id) => {
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) throw new AppError('Post not found', 404);
    return post;
  },

  create: (data) => prisma.post.create({ data }),

  update: (id, data) => prisma.post.update({ where: { id }, data }),

  remove: async (id) => {
    await prisma.post.delete({ where: { id } });
  },
};