import type { Request, Response } from 'express';
import { featureService } from '../container';
import { UnauthorizedError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { FeatureCreateInput, FeatureUpdateInput } from '../validators/featureValidators';

export const createFeature = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as FeatureCreateInput;
  const feature = await featureService.create(req.params.moduleId as string, body, req.user.id);
  res.status(201).json(feature);
});

export const updateFeature = asyncHandler(async (req: Request, res: Response) => {
  const feature = await featureService.update(
    req.params.id as string,
    req.body as FeatureUpdateInput,
  );
  res.status(200).json(feature);
});

export const deleteFeature = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  await featureService.delete(req.params.id as string, req.user.id);
  res.status(204).send();
});

export const updateFeatureStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { status } = req.body as { status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED' };
  const feature = await featureService.updateStatus(req.params.id as string, status, req.user.id);
  res.status(200).json(feature);
});

export const reorderFeatures = asyncHandler(async (req: Request, res: Response) => {
  const { order } = req.body as { order: string[] };
  const features = await featureService.reorder(req.params.moduleId as string, order);
  res.status(200).json({ data: features });
});
