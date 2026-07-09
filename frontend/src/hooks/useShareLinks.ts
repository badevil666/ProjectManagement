import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shareLinksApi } from '@/services/api';
import { queryKeys } from './queryKeys';
import { invalidateProjectScope } from './invalidation';
import type { ShareLinkCreateInput } from '@/types';

export function useShareLinks(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.shareLinks.list(projectId ?? ''),
    queryFn: () => shareLinksApi.list(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useCreateShareLink(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ShareLinkCreateInput) => shareLinksApi.create(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shareLinks.list(projectId) });
      invalidateProjectScope(queryClient, projectId);
    },
  });
}

export function useRevokeShareLink(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => shareLinksApi.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.shareLinks.list(projectId) });
      invalidateProjectScope(queryClient, projectId);
    },
  });
}
