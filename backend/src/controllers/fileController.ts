import type { Request, Response } from 'express';
import { fileService } from '../container';
import { UnauthorizedError, ValidationError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildContentDisposition } from '../utils/http';
import { logger } from '../utils/logger';

export const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  if (!req.file) throw new ValidationError('A file is required (multipart field "file")');

  const rawModuleId = (req.body as Record<string, unknown> | undefined)?.moduleId;
  const moduleId =
    typeof rawModuleId === 'string' && rawModuleId.length > 0 ? rawModuleId : undefined;

  const file = await fileService.upload({
    projectId: req.params.projectId as string,
    moduleId,
    buffer: req.file.buffer,
    originalName: req.file.originalname,
    mimeType: req.file.mimetype,
    uploadedBy: req.user.id,
  });

  res.status(201).json(file);
});

export const listFiles = asyncHandler(async (req: Request, res: Response) => {
  const moduleId = typeof req.query.moduleId === 'string' ? req.query.moduleId : undefined;
  const files = await fileService.listForProject(req.params.projectId as string, moduleId);
  res.status(200).json(files);
});

export const downloadFile = asyncHandler(async (req: Request, res: Response) => {
  const { file, stream } = await fileService.getFileForDownload(req.params.id as string);

  res.setHeader('Content-Type', file.mimeType);
  res.setHeader('Content-Disposition', buildContentDisposition(file.name));
  res.setHeader('Content-Length', String(file.size));

  stream.on('error', (error) => {
    logger.error(`Error streaming file ${file.id}`, error);
    res.destroy(error);
  });
  stream.pipe(res);
});

export const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  await fileService.delete(req.params.id as string);
  res.status(204).send();
});
