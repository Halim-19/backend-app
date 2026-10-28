import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  let payload;
  try {
    payload = jwt.verify(header.slice(7), env.jwtSecret, {
      algorithms: ['HS256'],
    });
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }

  // make sure the user still exists (they may have been deleted)
  const user = await prisma.user.findUnique({ where: { id: Number(payload.sub) } });
  if (!user) throw new AppError('User no longer exists', 401);

  req.user = user; // every later handler now knows who is calling
  next();
};

// Allow an action only when the :id in the URL is the logged-in user
export const authorizeSelf = (req, res, next) => {
  if (Number(req.params.id) !== req.user.id) {
    return next(new AppError('You can only modify your own account', 403));
  }
  next();
};