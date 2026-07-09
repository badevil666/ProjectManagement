import type { Request, Response } from 'express';
import { commentService } from '../container';
import { UnauthorizedError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { AdminCommentCreateInput } from '../validators/commentValidators';

export const listComments = asyncHandler(async (req: Request, res: Response) => {
  const comments = await commentService.listForProject(req.params.projectId as string);
  res.status(200).json(comments);
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { message } = req.body as AdminCommentCreateInput;
  const comment = await commentService.createAdminComment(
    req.params.projectId as string,
    message,
    req.user.name,
    req.user.id,
  );
  res.status(201).json(comment);
});
