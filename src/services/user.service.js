import { prisma } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';


export const userService = {

  getAll: async ({ page, limit, search, sortBy, order }) => {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};
      
    const orderBy = [
      { [sortBy]: order },
      ...(sortBy !== 'id' ? [{ id: order }] : []),
    ];
  
    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({ where, orderBy, ...getPagination({ page, limit }) }),
      prisma.user.count({ where }),
    ]);
  
    return { data: items, meta: buildMeta({ page, limit, total }) };
  },

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