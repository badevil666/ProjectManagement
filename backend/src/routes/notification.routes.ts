import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { validateBody } from '../middlewares/validate';
import {
  previewCompletionEmailSchema,
  sendCompletionEmailSchema,
} from '../validators/notificationValidators';

/** Mounted at /api/projects/:projectId/notifications (mergeParams for :projectId). */
export const nestedNotificationRouter = Router({ mergeParams: true });

nestedNotificationRouter.post(
  '/preview',
  validateBody(previewCompletionEmailSchema),
  notificationController.previewCompletionEmail,
);

nestedNotificationRouter.post(
  '/send',
  validateBody(sendCompletionEmailSchema),
  notificationController.sendCompletionEmail,
);
