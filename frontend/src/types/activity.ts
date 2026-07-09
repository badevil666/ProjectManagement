import type { ActivityType } from './enums';

export interface Activity {
  id: string;
  projectId: string;
  type: ActivityType;
  message: string;
  createdBy?: string | null;
  createdAt: string;
}

export interface ActivityQueryParams {
  limit?: number;
}

/** Cross-project activity feed entry returned by GET /api/dashboard/activity,
 * which additionally identifies which project it belongs to. */
export interface DashboardActivityEntry extends Activity {
  project?: {
    id: string;
    title: string;
  };
}
