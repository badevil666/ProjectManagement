import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny } from 'zod';
import { ValidationError } from '../utils/AppError';

/** Validates & replaces `req.body` against `schema`. Rejects unknown fields
 * (schemas must be built with `.strict()`). */
export function validateBody(schema: ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(new ValidationError('Validation failed', result.error.flatten()));
      return;
    }
    req.body = result.data;
    next();
  };
}

/** Validates & replaces `req.query` against `schema`. */
export function validateQuery(schema: ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      next(new ValidationError('Validation failed', result.error.flatten()));
      return;
    }
    // req.query is a getter-only property on some Express/Node versions —
    // mutate in place instead of reassigning.
    Object.assign(req.query, result.data);
    next();
  };
}

/** Validates `req.params` against `schema` (does not mutate). */
export function validateParams(schema: ZodTypeAny): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      next(new ValidationError('Validation failed', result.error.flatten()));
      return;
    }
    next();
  };
}
