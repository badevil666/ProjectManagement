import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/AppError';

/** Must run after `requireAuth`. Only one role exists (ADMIN) today, but this
 * keeps role-based access control explicit and extensible. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(new UnauthorizedError('Authentication required'));
    return;
  }
  if (req.user.role !== 'ADMIN') {
    next(new ForbiddenError('Admin role required'));
    return;
  }
  next();
}
