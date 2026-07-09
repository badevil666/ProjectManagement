import type { Request, Response } from 'express';
import { shareLinkService } from '../container';
import { UnauthorizedError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { ShareLinkCreateInput } from '../validators/shareLinkValidators';

export const createShareLink = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { expiresAt } = req.body as ShareLinkCreateInput;
  const result = await shareLinkService.create(
    req.params.projectId as string,
    expiresAt ? new Date(expiresAt) : null,
    req.user.id,
  );
  res.status(201).json(result);
});

export const listShareLinks = asyncHandler(async (req: Request, res: Response) => {
  const shareLinks = await shareLinkService.listForProject(req.params.projectId as string);
  res.status(200).json(shareLinks);
});

export const revokeShareLink = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const shareLink = await shareLinkService.revoke(req.params.id as string, req.user.id);
  res.status(200).json(shareLink);
});
