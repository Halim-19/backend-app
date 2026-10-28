import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

// fetch a post and verify the caller owns it
const getOwnedPost = async (id, userId) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) throw new AppError('Post not found', 404);
  if (post.authorId !== userId) {
    throw new AppError('You can only modify your own posts', 403);
  }
  return post;
};

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

  create: (data, userId) =>
    prisma.post.create({ data: { ...data, authorId: userId } }),

  update: async (id, userId, data) => {
    await getOwnedPost(id, userId);
    return prisma.post.update({ where: { id }, data });
  },

  remove: async (id, userId) => {
    await getOwnedPost(id, userId);
    await prisma.post.delete({ where: { id } });
  },
};