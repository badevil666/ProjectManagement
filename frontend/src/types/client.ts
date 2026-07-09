import type { ProjectPriority, ProjectStatus } from './enums';

export interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  industry?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Summary of a project as embedded in a client's detail response. */
export interface ClientProjectSummary {
  id: string;
  title: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  overallProgress: number;
  startDate?: string | null;
  expectedEndDate?: string | null;
  createdAt: string;
}

export interface ClientDetail extends Client {
  projects: ClientProjectSummary[];
}

export interface ClientInput {
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  address?: string;
  industry?: string;
  notes?: string;
}

export type ClientUpdateInput = Partial<ClientInput>;

export interface ClientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}
