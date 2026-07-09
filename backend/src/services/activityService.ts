import type { Activity, ActivityType } from '@prisma/client';
import type { ActivityWithProject, IActivityRepository } from '../repositories/activityRepository';

/**
 * Shared timeline/audit logger. Called from every mutating action listed in
 * PROJECT_SPEC.md's timeline checklist (project created, module/feature
 * created and completed, file uploaded, comment added, share link
 * created/revoked).
 */
export class ActivityService {
  constructor(private readonly activityRepository: IActivityRepository) {}

  async log(
    projectId: string,
    type: ActivityType,
    message: string,
    createdBy?: string | null,
  ): Promise<Activity> {
    return this.activityRepository.create({
      projectId,
      type,
      message,
      createdBy: createdBy ?? null,
    });
  }

  async listForProject(projectId: string): Promise<Activity[]> {
    return this.activityRepository.listByProject(projectId);
  }

  async listRecentAcrossProjects(limit: number): Promise<ActivityWithProject[]> {
    return this.activityRepository.listRecentAcrossProjects(limit);
  }
}
