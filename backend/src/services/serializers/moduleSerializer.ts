import type { Module } from '@prisma/client';
import type { ModuleWithFeatures } from '../../repositories/moduleRepository';
import { decimalToNumber } from '../../utils/money';
import { ProgressService } from '../progressService';
import { serializeFeature } from './featureSerializer';

export function serializeModule(module: Module, completionPercentage: number) {
  return {
    id: module.id,
    projectId: module.projectId,
    title: module.title,
    description: module.description,
    orderNumber: module.orderNumber,
    status: module.status,
    estimatedHours: decimalToNumber(module.estimatedHours),
    completionPercentage,
    completedAt: module.completedAt,
    createdAt: module.createdAt,
    updatedAt: module.updatedAt,
  };
}

/** Serializes a module together with its features, computing completion % inline. */
export function serializeModuleWithFeatures(
  module: ModuleWithFeatures,
  progressService: ProgressService,
) {
  const completionPercentage = progressService.computeModuleCompletionPercentage(module.features);
  return {
    ...serializeModule(module, completionPercentage),
    features: module.features.map(serializeFeature),
  };
}
