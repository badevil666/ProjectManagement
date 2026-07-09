import { Router } from 'express';
import * as shareController from '../controllers/shareController';
import { resolveShareLink } from '../middlewares/resolveShareLink';
import { validateBody } from '../middlewares/validate';
import { clientCommentCreateSchema } from '../validators/commentValidators';

/**
 * Public, token-gated routes — no JWT. `resolveShareLink` handles
 * 404 (unknown token) / 410 (revoked or expired) and access counting.
 * Rate limiting is applied centrally in routes/index.ts to blunt token
 * brute-forcing across all of these.
 */
const router = Router();

router.get('/:token', resolveShareLink, shareController.getSharedProject);
router.get('/:token/timeline', resolveShareLink, shareController.getSharedProjectTimeline);
router.get('/:token/files/:fileId/download', resolveShareLink, shareController.downloadSharedFile);
router.post(
  '/:token/comments',
  resolveShareLink,
  validateBody(clientCommentCreateSchema),
  shareController.createSharedComment,
);

export default router;
