import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

export const userService = {
  getAll: () => prisma.user.findMany({ orderBy: { id: 'asc' } }),

  getById: async (id) => {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new AppError('User not found', 404);
    return user;
  },


  update: (id, data) => prisma.user.update({ where: { id }, data }),

  remove: async (id) => {
    await prisma.user.delete({ where: { id } });
  },
};