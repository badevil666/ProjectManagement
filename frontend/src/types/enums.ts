// Enum-like string union types mirroring backend/prisma/schema.prisma exactly.
// Kept as string literal unions (not TS `enum`) so they serialize/compare
// trivially against JSON from the API.

export type UserRole = 'ADMIN';

export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';

export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export type ModuleStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED';

export type FeatureStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

export type FeaturePriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type AuthorType = 'ADMIN' | 'CLIENT';

export type ActivityType =
  | 'PROJECT_CREATED'
  | 'PROJECT_STATUS_CHANGED'
  | 'MODULE_CREATED'
  | 'MODULE_COMPLETED'
  | 'FEATURE_CREATED'
  | 'FEATURE_COMPLETED'
  | 'FILE_UPLOADED'
  | 'COMMENT_ADDED'
  | 'SHARE_LINK_CREATED'
  | 'SHARE_LINK_REVOKED';

export const PROJECT_STATUSES: ProjectStatus[] = [
  'PLANNING',
  'IN_PROGRESS',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
];

export const PROJECT_PRIORITIES: ProjectPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export const MODULE_STATUSES: ModuleStatus[] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'BLOCKED',
  'COMPLETED',
];

export const FEATURE_STATUSES: FeatureStatus[] = ['TODO', 'IN_PROGRESS', 'COMPLETED'];

export const FEATURE_PRIORITIES: FeaturePriority[] = ['LOW', 'MEDIUM', 'HIGH'];
