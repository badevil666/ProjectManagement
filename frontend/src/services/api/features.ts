import { apiClient } from './client';
import type {
  Feature,
  FeatureInput,
  FeatureStatusInput,
  FeatureUpdateInput,
  ReorderInput,
} from '@/types';

export const featuresApi = {
  create: async (moduleId: string, body: FeatureInput): Promise<Feature> => {
    const { data } = await apiClient.post<Feature>(`/modules/${moduleId}/features`, body);
    return data;
  },

  update: async (id: string, body: FeatureUpdateInput): Promise<Feature> => {
    const { data } = await apiClient.put<Feature>(`/features/${id}`, body);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/features/${id}`);
  },

  updateStatus: async (id: string, body: FeatureStatusInput): Promise<Feature> => {
    const { data } = await apiClient.patch<Feature>(`/features/${id}/status`, body);
    return data;
  },

  reorder: async (moduleId: string, body: ReorderInput): Promise<void> => {
    await apiClient.patch(`/modules/${moduleId}/features/reorder`, body);
  },
};
