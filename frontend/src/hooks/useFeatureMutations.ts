import { useMutation, useQueryClient } from '@tanstack/react-query';
import { featuresApi } from '@/services/api';
import { invalidateProjectScope } from './invalidation';
import type { FeatureInput, FeatureStatus, FeatureUpdateInput } from '@/types';

/**
 * Bundles every feature mutation for a project. `projectId` is required (even
 * though the feature endpoints are keyed by moduleId/featureId, not
 * projectId) purely so we know the correct blast radius to invalidate —
 * completing a feature recomputes the parent module AND the project's
 * overall progress, and shows up in the timeline + dashboard activity feed.
 */
export function useFeatureMutations(projectId: string) {
  const queryClient = useQueryClient();

  const onSettled = () => invalidateProjectScope(queryClient, projectId);

  const createFeature = useMutation({
    mutationFn: ({ moduleId, body }: { moduleId: string; body: FeatureInput }) =>
      featuresApi.create(moduleId, body),
    onSuccess: onSettled,
  });

  const updateFeature = useMutation({
    mutationFn: ({ id, body }: { id: string; body: FeatureUpdateInput }) =>
      featuresApi.update(id, body),
    onSuccess: onSettled,
  });

  const deleteFeature = useMutation({
    mutationFn: (id: string) => featuresApi.remove(id),
    onSuccess: onSettled,
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeatureStatus }) =>
      featuresApi.updateStatus(id, { status }),
    onSuccess: onSettled,
  });

  const reorderFeatures = useMutation({
    mutationFn: ({ moduleId, order }: { moduleId: string; order: string[] }) =>
      featuresApi.reorder(moduleId, { order }),
    onSuccess: onSettled,
  });

  return { createFeature, updateFeature, deleteFeature, updateStatus, reorderFeatures };
}
