import { Response } from 'express';

export function successResponse(res: Response, data: unknown, message = 'Success') {
  return res.json({ data, message });
}

export function errorResponse(res: Response, error: string, status = 400, details?: unknown) {
  return res.status(status).json(details !== undefined ? { error, details } : { error });
}

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed') {
    super(400, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}
