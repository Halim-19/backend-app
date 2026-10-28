import { AppError } from '../utils/AppError.js';

const formatIssues = (issues) =>
  issues
    .map((i) => (i.path.length ? `${i.path.join('.')}: ${i.message}` : i.message))
    .join(', ');

export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(formatIssues(result.error.issues), 400));
  }
  req.body = result.data; // use the cleaned data
  next();
};

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return next(new AppError(formatIssues(result.error.issues), 400));
  }
  res.locals.query = result.data; // req.query is read-only in Express 5
  next();
};