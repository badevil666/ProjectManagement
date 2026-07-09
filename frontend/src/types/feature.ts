import type { FeaturePriority, FeatureStatus } from './enums';

export interface Feature {
  id: string;
  moduleId: string;
  title: string;
  description?: string | null;
  status: FeatureStatus;
  priority: FeaturePriority;
  orderNumber: number;
  estimatedHours?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureInput {
  title: string;
  description?: string;
  priority?: FeaturePriority;
  estimatedHours?: number;
}

export type FeatureUpdateInput = Partial<FeatureInput>;

export interface FeatureStatusInput {
  status: FeatureStatus;
}

export interface ReorderInput {
  order: string[];
}
