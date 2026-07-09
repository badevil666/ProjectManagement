import type { ModuleWithFeatures } from '@/types';

/** Module completion % = completedFeatures / totalFeatures (0 if none),
 * mirroring the backend's "Progress calculation" rule. Computed client-side
 * from the embedded features array so the UI stays correct even if a
 * mutation response hasn't round-tripped yet. */
export function getModuleCompletion(module: Pick<ModuleWithFeatures, 'features'>): number {
  const total = module.features.length;
  if (total === 0) return 0;
  const completed = module.features.filter((f) => f.status === 'COMPLETED').length;
  return Math.round((completed / total) * 100);
}
