import type { ProjectPriority, ProjectStatus } from './enums';
import type { ModuleWithFeatures } from './module';
import type { ProjectFile } from './file';
import type { ProjectClientSummary } from './project';
import type { Comment } from './comment';

/**
 * GET /api/share/:token — same shape as the admin project detail, minus
 * internal fields (`createdBy`), budget included, and with the full
 * `comments` list embedded instead of a bare `commentCount` (there is no
 * standalone list endpoint for share-link comments, so they must travel
 * with the project payload).
 */
export interface SharedProjectDetail {
  id: string;
  client: ProjectClientSummary;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string | null;
  expectedEndDate?: string | null;
  actualEndDate?: string | null;
  overallProgress: number;
  budget?: string | null;
  currency: string;
  createdAt: string;
  updatedAt: string;
  modules: ModuleWithFeatures[];
  files: ProjectFile[];
  comments: Comment[];
}
