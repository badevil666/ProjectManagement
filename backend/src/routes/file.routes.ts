import { Router } from 'express';
import * as fileController from '../controllers/fileController';
import { upload } from '../middlewares/upload';
import { validateQuery } from '../middlewares/validate';
import { fileListQuerySchema } from '../validators/fileValidators';

/** Mounted at /api/projects/:projectId/files (mergeParams for :projectId). */
export const nestedFileRouter = Router({ mergeParams: true });
nestedFileRouter.post('/', upload.single('file'), fileController.uploadFile);
nestedFileRouter.get('/', validateQuery(fileListQuerySchema), fileController.listFiles);

/** Mounted at /api/files. */
export const fileByIdRouter = Router();
fileByIdRouter.get('/:id/download', fileController.downloadFile);
fileByIdRouter.delete('/:id', fileController.deleteFile);
