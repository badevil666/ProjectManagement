import type { Request, Response } from 'express';
import { projectService } from '../container';
import { UnauthorizedError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import type {
  ProjectCreateInput,
  ProjectListQuery,
  ProjectUpdateInput,
} from '../validators/projectValidators';

export const listProjects = asyncHandler(async (req: Request, res: Response) => {
  const query = req.query as unknown as ProjectListQuery;
  const result = await projectService.list(query);
  res.status(200).json(result);
});

export const getProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectService.getById(req.params.id as string);
  res.status(200).json(project);
});

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const body = req.body as ProjectCreateInput;
  const project = await projectService.create(body, req.user.id);
  res.status(201).json(project);
});

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new UnauthorizedError();
  const project = await projectService.update(
    req.params.id as string,
    req.body as ProjectUpdateInput,
    req.user.id,
  );
  res.status(200).json(project);
});

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectService.delete(req.params.id as string);
  res.status(204).send();
});

export const getProjectTimeline = asyncHandler(async (req: Request, res: Response) => {
  const timeline = await projectService.getTimeline(req.params.id as string);
  res.status(200).json(timeline);
});
