import { Router } from 'express';
import * as featureController from '../controllers/featureController';
import { validateBody } from '../middlewares/validate';
import { orderBodySchema } from '../validators/common';
import {
  featureCreateSchema,
  featureStatusSchema,
  featureUpdateSchema,
} from '../validators/featureValidators';

/** Mounted at /api/modules/:moduleId/features (mergeParams for :moduleId). */
export const nestedFeatureRouter = Router({ mergeParams: true });
nestedFeatureRouter.post('/', validateBody(featureCreateSchema), featureController.createFeature);
nestedFeatureRouter.patch(
  '/reorder',
  validateBody(orderBodySchema),
  featureController.reorderFeatures,
);

/** Mounted at /api/features. */
export const featureByIdRouter = Router();
featureByIdRouter.put('/:id', validateBody(featureUpdateSchema), featureController.updateFeature);
featureByIdRouter.delete('/:id', featureController.deleteFeature);
featureByIdRouter.patch(
  '/:id/status',
  validateBody(featureStatusSchema),
  featureController.updateFeatureStatus,
);
