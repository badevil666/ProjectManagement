import { shareLinkService } from '../container';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Resolves `req.params.token` to a project: 404 if unknown, 410 Gone if
 * revoked/expired, else increments accessCount/lastAccessedAt and attaches
 * `req.shareLink` (including the linked project id) for downstream handlers.
 */
export const resolveShareLink = asyncHandler(async (req, _res, next) => {
  const { token } = req.params;
  const resolved = await shareLinkService.resolveToken(token as string);
  req.shareLink = resolved;
  next();
});
