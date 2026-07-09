import { apiClient } from './client';
import type {
  Module,
  ModuleInput,
  ModuleStatusInput,
  ModuleUpdateInput,
  ReorderInput,
} from '@/types';

export const modulesApi = {
  create: async (projectId: string, body: ModuleInput): Promise<Module> => {
    const { data } = await apiClient.post<Module>(`/projects/${projectId}/modules`, body);
    return data;
  },

  update: async (id: string, body: ModuleUpdateInput): Promise<Module> => {
    const { data } = await apiClient.put<Module>(`/modules/${id}`, body);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/modules/${id}`);
  },

  updateStatus: async (id: string, body: ModuleStatusInput): Promise<Module> => {
    const { data } = await apiClient.patch<Module>(`/modules/${id}/status`, body);
    return data;
  },

  reorder: async (projectId: string, body: ReorderInput): Promise<void> => {
    await apiClient.patch(`/projects/${projectId}/modules/reorder`, body);
  },
};
