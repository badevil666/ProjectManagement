import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/services/api';
import { queryKeys } from './queryKeys';

export function useTimeline(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.projects.timeline(projectId ?? ''),
    queryFn: () => projectsApi.timeline(projectId as string),
    enabled: Boolean(projectId),
  });
}
