import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

interface ErrorResponseBody {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

function mapPrismaError(error: Prisma.PrismaClientKnownRequestError): AppError | null {
  switch (error.code) {
    case 'P2002':
      return new AppError(
        'A record with these unique fields already exists',
        409,
        'CONFLICT',
        error.meta,
      );
    case 'P2025':
      return new AppError('Resource not found', 404, 'NOT_FOUND', undefined);
    case 'P2003':
      return new AppError('Related resource does not exist', 400, 'VALIDATION_ERROR', error.meta);
    default:
      return null;
  }
}

/**
 * Centralized error handler — MUST be the last `app.use()`. Maps AppError
 * subclasses (and a few well-known Prisma/body-parser errors) to the exact
 * `{ error: { message, code, details } }` shape, and never leaks a stack
 * trace to the client.
 */

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  let resolved: AppError;

  if (err instanceof AppError) {
    resolved = err;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    resolved = mapPrismaError(err) ?? new AppError('Internal server error', 500, 'INTERNAL_ERROR');
  } else if (err instanceof SyntaxError && 'body' in err) {
    // express.json() throws a SyntaxError for malformed request bodies.
    resolved = new AppError('Malformed JSON in request body', 400, 'VALIDATION_ERROR');
  } else {
    resolved = new AppError('Internal server error', 500, 'INTERNAL_ERROR');
  }

  if (resolved.statusCode >= 500) {
    logger.error(`Unhandled error on ${req.method} ${req.originalUrl}`, err);
  }

  const body: ErrorResponseBody = {
    error: {
      message: resolved.message,
      code: resolved.code,
      ...(resolved.details !== undefined ? { details: resolved.details } : {}),
    },
  };

  res.status(resolved.statusCode).json(body);
}
