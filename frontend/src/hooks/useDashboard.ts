import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { queryKeys } from './queryKeys';
import type { ActivityQueryParams } from '@/types';

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => dashboardApi.getStats(),
  });
}

export function useDashboardActivity(params?: ActivityQueryParams) {
  return useQuery({
    queryKey: queryKeys.dashboard.activity(params),
    queryFn: () => dashboardApi.getActivity(params),
  });
}
