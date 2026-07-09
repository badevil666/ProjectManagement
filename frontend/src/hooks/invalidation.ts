import type { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * Any mutation that changes project state (modules, features, files,
 * comments, share links) can ripple into: the project detail (progress %,
 * embedded modules/features/files/shareLinks), that project's timeline,
 * the project list (status/progress shown there), and the cross-project
 * dashboard stats + activity feed. Centralizing this means every mutation
 * hook invalidates the full blast radius instead of just the one query it
 * directly touched.
 */
export function invalidateProjectScope(queryClient: QueryClient, projectId: string): void {
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.timeline(projectId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.projects.all() });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats() });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.activityAll() });
}
