import { apiClient } from './client';
import type { ActivityQueryParams, DashboardActivityEntry, DashboardStats } from '@/types';

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await apiClient.get<DashboardStats>('/dashboard/stats');
    return data;
  },

  getActivity: async (params?: ActivityQueryParams): Promise<DashboardActivityEntry[]> => {
    const { data } = await apiClient.get<DashboardActivityEntry[]>('/dashboard/activity', {
      params,
    });
    return data;
  },
};
