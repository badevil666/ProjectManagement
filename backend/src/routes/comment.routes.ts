import { Router } from 'express';
import * as commentController from '../controllers/commentController';
import { validateBody } from '../middlewares/validate';
import { adminCommentCreateSchema } from '../validators/commentValidators';

/** Mounted at /api/projects/:projectId/comments (mergeParams for :projectId). */
export const nestedCommentRouter = Router({ mergeParams: true });
nestedCommentRouter.get('/', commentController.listComments);
nestedCommentRouter.post(
  '/',
  validateBody(adminCommentCreateSchema),
  commentController.createComment,
);
