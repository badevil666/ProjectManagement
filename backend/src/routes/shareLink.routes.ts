import { Router } from 'express';
import * as shareLinkController from '../controllers/shareLinkController';
import { validateBody } from '../middlewares/validate';
import { shareLinkCreateSchema } from '../validators/shareLinkValidators';

/** Mounted at /api/projects/:projectId/share-links (mergeParams for :projectId). */
export const nestedShareLinkRouter = Router({ mergeParams: true });
nestedShareLinkRouter.post(
  '/',
  validateBody(shareLinkCreateSchema),
  shareLinkController.createShareLink,
);
nestedShareLinkRouter.get('/', shareLinkController.listShareLinks);

/** Mounted at /api/share-links. */
export const shareLinkByIdRouter = Router();
shareLinkByIdRouter.patch('/:id/revoke', shareLinkController.revokeShareLink);
