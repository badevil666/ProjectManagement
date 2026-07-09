import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/services/api';
import { queryKeys } from './queryKeys';
import { invalidateProjectScope } from './invalidation';
import type { CommentInput } from '@/types';

export function useComments(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.comments.list(projectId ?? ''),
    queryFn: () => commentsApi.list(projectId as string),
    enabled: Boolean(projectId),
  });
}

export function useCreateComment(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CommentInput) => commentsApi.create(projectId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(projectId) });
      invalidateProjectScope(queryClient, projectId);
    },
  });
}
