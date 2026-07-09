// Centralized query key factories so every hook/invalidation call agrees on
// the exact same key shape. Keep params in the key so different filters
// don't collide in the cache.
import type { ActivityQueryParams, ClientsQueryParams, ProjectsQueryParams } from '@/types';

export const queryKeys = {
  dashboard: {
    stats: () => ['dashboard', 'stats'] as const,
    activity: (params?: ActivityQueryParams) => ['dashboard', 'activity', params] as const,
    // Prefix-only key (no params slot) so invalidateQueries can partial-match
    // every cached activity query regardless of its params, the same way
    // clients.all()/projects.all() broadly invalidate their `list` queries.
    // Passing activity() with no params does NOT do this: it produces
    // ['dashboard','activity', undefined], which fails TanStack Query's
    // partialMatchKey typeof check against a cached ['dashboard','activity',
    // { limit: 20 }] key and silently never invalidates it.
    activityAll: () => ['dashboard', 'activity'] as const,
  },
  clients: {
    all: () => ['clients'] as const,
    list: (params?: ClientsQueryParams) => ['clients', 'list', params] as const,
    detail: (id: string) => ['clients', 'detail', id] as const,
  },
  projects: {
    all: () => ['projects'] as const,
    list: (params?: ProjectsQueryParams) => ['projects', 'list', params] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    timeline: (id: string) => ['projects', 'timeline', id] as const,
  },
  files: {
    list: (projectId: string, moduleId?: string) =>
      ['files', 'list', projectId, moduleId ?? null] as const,
  },
  shareLinks: {
    list: (projectId: string) => ['shareLinks', 'list', projectId] as const,
  },
  comments: {
    list: (projectId: string) => ['comments', 'list', projectId] as const,
  },
  share: {
    project: (token: string) => ['share', 'project', token] as const,
    timeline: (token: string) => ['share', 'timeline', token] as const,
  },
};
