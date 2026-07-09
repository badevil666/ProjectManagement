import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shareApi } from '@/services/api';
import { queryKeys } from './queryKeys';
import type { ShareCommentInput } from '@/types';

export function useSharedProject(token: string | undefined) {
  return useQuery({
    queryKey: queryKeys.share.project(token ?? ''),
    queryFn: () => shareApi.getProject(token as string),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useShareTimeline(token: string | undefined) {
  return useQuery({
    queryKey: queryKeys.share.timeline(token ?? ''),
    queryFn: () => shareApi.getTimeline(token as string),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useShareComment(token: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ShareCommentInput) => shareApi.addComment(token, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.share.project(token) });
      queryClient.invalidateQueries({ queryKey: queryKeys.share.timeline(token) });
    },
  });
}
