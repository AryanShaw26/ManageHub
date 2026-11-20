import { errorResponse, AppError } from '../utils/response.js';
import config from '../config/index.js';

export const notFoundHandler = (req, res) => {
  return errorResponse(res, 404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`);
};

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return errorResponse(res, err.statusCode, err.code, err.message, err.details);
  }

  // Handle Prisma unique constraint violations
  if (err.code === 'P2002') {
    const fields = err.meta?.target || [];
    return errorResponse(
      res,
      409,
      'CONFLICT',
      `A record with this ${fields.join(', ')} already exists`,
      [{ field: fields, message: 'Unique constraint failed' }]
    );
  }

  // Handle Prisma not found errors
  if (err.code === 'P2025') {
    return errorResponse(res, 404, 'NOT_FOUND', 'Requested resource was not found');
  }

  console.error('Unhandled error:', err);

  const message = config.isProduction ? 'An unexpected internal server error occurred' : err.message;
  return errorResponse(res, 500, 'INTERNAL_SERVER_ERROR', message);
};
