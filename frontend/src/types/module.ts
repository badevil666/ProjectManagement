import type { Feature } from './feature';
import type { ModuleStatus } from './enums';

export interface Module {
  id: string;
  projectId: string;
  title: string;
  description?: string | null;
  orderNumber: number;
  status: ModuleStatus;
  estimatedHours?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Project detail responses embed each module's features. */
export interface ModuleWithFeatures extends Module {
  features: Feature[];
}

export interface ModuleInput {
  title: string;
  description?: string;
  estimatedHours?: number;
}

export type ModuleUpdateInput = Partial<ModuleInput>;

export interface ModuleStatusInput {
  status: ModuleStatus;
}
