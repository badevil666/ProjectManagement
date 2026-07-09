import type { Request, Response } from 'express';
import { dashboardService } from '../container';
import { asyncHandler } from '../utils/asyncHandler';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const stats = await dashboardService.getStats();
  res.status(200).json(stats);
});

export const getActivity = asyncHandler(async (req: Request, res: Response) => {
  const rawLimit = Number.parseInt(String(req.query.limit ?? '20'), 10);
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 20;
  const activity = await dashboardService.getRecentActivity(limit);
  res.status(200).json(activity);
});
