import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export const notFound = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

// Translate known database errors into friendly HTTP errors
const handlePrismaError = (err) => {
  if (err.code === 'P2002') {
    const fields = err.meta?.target?.join?.(', ') ?? 'field';
    return new AppError(`A record with this ${fields} already exists`, 409);
  }
  if (err.code === 'P2025') {
    return new AppError('Record not found', 404);
  }
  return err;
};

export const errorHandler = (err, req, res, next) => {
  const error = handlePrismaError(err);
  const status = error.statusCode || 500;

  if (status === 500) console.error(err);

  res.status(status).json({
    message:
      status === 500 && env.nodeEnv === 'production'
        ? 'Internal server error'
        : error.message,
  });
};