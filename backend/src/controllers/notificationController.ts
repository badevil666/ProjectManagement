import type { Request, Response } from 'express';
import { projectNotificationService } from '../container';
import { UnauthorizedError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type {
  PreviewCompletionEmailInput,
  SendCompletionEmailInput,
} from '../validators/notificationValidators';

export const sendCompletionEmail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as SendCompletionEmailInput;
  const result = await projectNotificationService.sendCompletionEmail(
    req.params.projectId as string,
    body,
  );
  res.status(200).json(result);
});

export const previewCompletionEmail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as PreviewCompletionEmailInput;
  const preview = await projectNotificationService.previewEmail(
    req.params.projectId as string,
    body,
  );
  res.status(200).json(preview);
});
