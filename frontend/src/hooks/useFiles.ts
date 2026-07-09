import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/services/api';
import { queryKeys } from './queryKeys';
import { invalidateProjectScope } from './invalidation';
import type { FilesQueryParams } from '@/types';

export function useFiles(projectId: string | undefined, params?: FilesQueryParams) {
  return useQuery({
    queryKey: queryKeys.files.list(projectId ?? '', params?.moduleId),
    queryFn: () => filesApi.list(projectId as string, params),
    enabled: Boolean(projectId),
  });
}

export function useUploadFile(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      moduleId,
      onProgress,
    }: {
      file: File;
      moduleId?: string;
      onProgress?: (percent: number) => void;
    }) => filesApi.upload(projectId, file, moduleId, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list(projectId) });
      invalidateProjectScope(queryClient, projectId);
    },
  });
}

export function useDeleteFile(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.files.list(projectId) });
      invalidateProjectScope(queryClient, projectId);
    },
  });
}
