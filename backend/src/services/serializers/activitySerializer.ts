import type { Activity } from '@prisma/client';
import type { ActivityWithProject } from '../../repositories/activityRepository';

export function serializeActivity(activity: Activity) {
  return {
    id: activity.id,
    projectId: activity.projectId,
    type: activity.type,
    message: activity.message,
    createdBy: activity.createdBy,
    createdAt: activity.createdAt,
  };
}

export function serializeActivityWithProject(activity: ActivityWithProject) {
  return {
    ...serializeActivity(activity),
    project: { id: activity.project.id, title: activity.project.title },
  };
}
