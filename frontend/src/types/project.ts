import type { ProjectPriority, ProjectStatus } from './enums';
import type { ModuleWithFeatures } from './module';
import type { ProjectFile } from './file';
import type { ShareLink } from './shareLink';

/** Minimal client info embedded in project list/detail responses. */
export interface ProjectClientSummary {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
}

interface ProjectBase {
  id: string;
  clientId: string;
  client: ProjectClientSummary;
  title: string;
  description?: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate?: string | null;
  expectedEndDate?: string | null;
  actualEndDate?: string | null;
  /** 0-100 integer, derived from module/feature completion. */
  overallProgress: number;
  budget?: string | null;
  currency: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Shape returned by GET /api/projects (list). */
export interface ProjectListItem extends ProjectBase {}

/** Shape returned by GET /api/projects/:id (detail). */
export interface ProjectDetail extends ProjectBase {
  modules: ModuleWithFeatures[];
  files: ProjectFile[];
  /** Active share links only, per contract. */
  shareLinks: ShareLink[];
  commentCount: number;
}

export interface ProjectInput {
  clientId: string;
  title: string;
  description?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  expectedEndDate?: string;
  budget?: string;
  currency?: string;
}

export type ProjectUpdateInput = Partial<ProjectInput>;

export interface ProjectsQueryParams {
  page?: number;
  limit?: number;
  status?: ProjectStatus;
  clientId?: string;
  search?: string;
}
