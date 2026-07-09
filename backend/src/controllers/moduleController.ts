import type { Request, Response } from 'express';
import { moduleService } from '../container';
import { UnauthorizedError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type { ModuleCreateInput, ModuleUpdateInput } from '../validators/moduleValidators';

export const createModule = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as ModuleCreateInput;
  const module = await moduleService.create(req.params.projectId as string, body, req.user.id);
  res.status(201).json(module);
});

export const updateModule = asyncHandler(async (req: Request, res: Response) => {
  const module = await moduleService.update(req.params.id as string, req.body as ModuleUpdateInput);
  res.status(200).json(module);
});

export const deleteModule = asyncHandler(async (req: Request, res: Response) => {
  await moduleService.delete(req.params.id as string);
  res.status(204).send();
});

export const updateModuleStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const { status } = req.body as {
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';
  };
  const module = await moduleService.updateStatus(req.params.id as string, status, req.user.id);
  res.status(200).json(module);
});

export const reorderModules = asyncHandler(async (req: Request, res: Response) => {
  const { order } = req.body as { order: string[] };
  const modules = await moduleService.reorder(req.params.projectId as string, order);
  res.status(200).json({ data: modules });
});
