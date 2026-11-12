import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message || 'Internal server error';
    error = new ApiError(statusCode, message, [], err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors || [],
  };

  if (env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  // Log server errors
  if (error.statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - ${error.message}`, {
      requestId: req.id,
      statusCode: error.statusCode,
    });
  }

  res.status(error.statusCode).json(response);
};
