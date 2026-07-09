import { useMutation, useQueryClient } from '@tanstack/react-query';
import { modulesApi } from '@/services/api';
import { invalidateProjectScope } from './invalidation';
import type { ModuleInput, ModuleStatus, ModuleUpdateInput } from '@/types';

/**
 * Bundles every module mutation for a given project. Every mutation
 * invalidates the full project-scoped blast radius (project detail,
 * timeline, project list, dashboard stats + activity) since module changes
 * affect all of them (progress %, activity feed, etc).
 */
export function useModuleMutations(projectId: string) {
  const queryClient = useQueryClient();

  const onSettled = () => invalidateProjectScope(queryClient, projectId);

  const createModule = useMutation({
    mutationFn: (body: ModuleInput) => modulesApi.create(projectId, body),
    onSuccess: onSettled,
  });

  const updateModule = useMutation({
    mutationFn: ({ id, body }: { id: string; body: ModuleUpdateInput }) =>
      modulesApi.update(id, body),
    onSuccess: onSettled,
  });

  const deleteModule = useMutation({
    mutationFn: (id: string) => modulesApi.remove(id),
    onSuccess: onSettled,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ModuleStatus }) =>
      modulesApi.updateStatus(id, { status }),
    onSuccess: onSettled,
  });

  const reorderModules = useMutation({
    mutationFn: (order: string[]) => modulesApi.reorder(projectId, { order }),
    onSuccess: onSettled,
  });

  return { createModule, updateModule, deleteModule, updateStatus, reorderModules };
}
