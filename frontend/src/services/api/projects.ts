import { apiClient } from './client';
import type {
  Activity,
  PaginatedResponse,
  ProjectDetail,
  ProjectInput,
  ProjectListItem,
  ProjectUpdateInput,
  ProjectsQueryParams,
} from '@/types';

export const projectsApi = {
  list: async (params?: ProjectsQueryParams): Promise<PaginatedResponse<ProjectListItem>> => {
    const { data } = await apiClient.get<PaginatedResponse<ProjectListItem>>('/projects', {
      params,
    });
    return data;
  },

  get: async (id: string): Promise<ProjectDetail> => {
    const { data } = await apiClient.get<ProjectDetail>(`/projects/${id}`);
    return data;
  },

  create: async (body: ProjectInput): Promise<ProjectDetail> => {
    const { data } = await apiClient.post<ProjectDetail>('/projects', body);
    return data;
  },

  update: async (id: string, body: ProjectUpdateInput): Promise<ProjectDetail> => {
    const { data } = await apiClient.put<ProjectDetail>(`/projects/${id}`, body);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  timeline: async (id: string): Promise<Activity[]> => {
    const { data } = await apiClient.get<Activity[]>(`/projects/${id}/timeline`);
    return data;
  },
};
