import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const signToken = (user) =>
  jwt.sign({ sub: String(user.id) }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });

export const authService = {
  register: async ({ name, email, password }) => {
  const hash = await bcrypt.hash(password, env.bcryptRounds);    
  // duplicate email → Prisma P2002 → our error handler returns 409
    const user = await prisma.user.create({
      data: { name, email, password: hash },
    });
    return { user, token: signToken(user) };
  },

  login: async ({ email, password }) => {
    // explicitly ask for the password, since it is omitted by default
    const found = await prisma.user.findUnique({
      where: { email },
      omit: { password: false },
    });

    // same message for "no such email" and "wrong password",
    // so attackers can't discover which emails are registered
    const valid = found && (await bcrypt.compare(password, found.password));
    if (!valid) throw new AppError('Invalid email or password', 401);

    const { password: _hash, ...user } = found;
    return { user, token: signToken(user) };
  },
};