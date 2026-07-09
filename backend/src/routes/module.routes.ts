import { Router } from 'express';
import * as moduleController from '../controllers/moduleController';
import { validateBody } from '../middlewares/validate';
import {
  moduleCreateSchema,
  moduleStatusSchema,
  moduleUpdateSchema,
} from '../validators/moduleValidators';
import { orderBodySchema } from '../validators/common';

/** Mounted at /api/projects/:projectId/modules (mergeParams for :projectId). */
export const nestedModuleRouter = Router({ mergeParams: true });
nestedModuleRouter.post('/', validateBody(moduleCreateSchema), moduleController.createModule);
nestedModuleRouter.patch(
  '/reorder',
  validateBody(orderBodySchema),
  moduleController.reorderModules,
);

/** Mounted at /api/modules. */
export const moduleByIdRouter = Router();
moduleByIdRouter.put('/:id', validateBody(moduleUpdateSchema), moduleController.updateModule);
moduleByIdRouter.delete('/:id', moduleController.deleteModule);
moduleByIdRouter.patch(
  '/:id/status',
  validateBody(moduleStatusSchema),
  moduleController.updateModuleStatus,
);
