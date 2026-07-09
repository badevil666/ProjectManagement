import type { Activity, ActivityType, Prisma } from '@prisma/client';
import { prisma } from './base';

export interface ActivityCreateData {
  projectId: string;
  type: ActivityType;
  message: string;
  createdBy?: string | null;
}

const activityWithProjectInclude = {
  project: { select: { id: true, title: true } },
} satisfies Prisma.ActivityInclude;

export type ActivityWithProject = Prisma.ActivityGetPayload<{
  include: typeof activityWithProjectInclude;
}>;

export interface IActivityRepository {
  listByProject(projectId: string): Promise<Activity[]>;
  create(data: ActivityCreateData): Promise<Activity>;
  listRecentAcrossProjects(limit: number): Promise<ActivityWithProject[]>;
}

export class PrismaActivityRepository implements IActivityRepository {
  async listByProject(projectId: string): Promise<Activity[]> {
    return prisma.activity.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  }

  async create(data: ActivityCreateData): Promise<Activity> {
    return prisma.activity.create({
      data: {
        projectId: data.projectId,
        type: data.type,
        message: data.message,
        createdBy: data.createdBy ?? null,
      },
    });
  }

  async listRecentAcrossProjects(limit: number): Promise<ActivityWithProject[]> {
    return prisma.activity.findMany({
      include: activityWithProjectInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const activityRepository: IActivityRepository = new PrismaActivityRepository();
