import type { Request, Response } from 'express';
import { commentService, fileService, projectService } from '../container';
import { NotFoundError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildContentDisposition } from '../utils/http';
import { logger } from '../utils/logger';
import type { ResolvedShareLink } from '../types/express';
import type { ClientCommentCreateInput } from '../validators/commentValidators';

function requireShareLink(req: Request): ResolvedShareLink {
  if (!req.shareLink) throw new NotFoundError('Share link not found');
  return req.shareLink;
}

export const getSharedProject = asyncHandler(async (req: Request, res: Response) => {
  const shareLink = requireShareLink(req);
  const project = await projectService.getDetailForShare(shareLink.projectId, shareLink.token);
  res.status(200).json(project);
});

export const getSharedProjectTimeline = asyncHandler(async (req: Request, res: Response) => {
  const shareLink = requireShareLink(req);
  const timeline = await projectService.getTimeline(shareLink.projectId);
  res.status(200).json(timeline);
});

export const downloadSharedFile = asyncHandler(async (req: Request, res: Response) => {
  const shareLink = requireShareLink(req);
  const { file, stream } = await fileService.getFileForDownload(req.params.fileId as string);

  // Validate the file actually belongs to this share link's project before
  // streaming a single byte — never trust the fileId alone.
  if (file.projectId !== shareLink.projectId) {
    throw new NotFoundError('File not found');
  }

  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', buildContentDisposition(file.name));
  res.setHeader('Content-Length', String(file.size));

  stream.on('error', (error) => {
    logger.error(`Error streaming shared file ${file.id}`, error);
    res.destroy(error);
  });
  stream.pipe(res);
});

export const createSharedComment = asyncHandler(async (req: Request, res: Response) => {
  const shareLink = requireShareLink(req);
  const { authorName, message } = req.body as ClientCommentCreateInput;
  const comment = await commentService.createClientComment(
    shareLink.projectId,
    authorName,
    message,
  );
  res.status(201).json(comment);
});
