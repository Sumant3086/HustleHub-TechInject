import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
    });
  }

  console.error('Unexpected error:', error);

  return res.status(500).json({
    error: 'Internal server error',
  });
}
