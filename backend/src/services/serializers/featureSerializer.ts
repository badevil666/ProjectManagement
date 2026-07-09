import type { Feature } from '@prisma/client';
import { decimalToNumber } from '../../utils/money';

export function serializeFeature(feature: Feature) {
  return {
    id: feature.id,
    moduleId: feature.moduleId,
    title: feature.title,
    description: feature.description,
    status: feature.status,
    priority: feature.priority,
    orderNumber: feature.orderNumber,
    estimatedHours: decimalToNumber(feature.estimatedHours),
    completedAt: feature.completedAt,
    createdAt: feature.createdAt,
    updatedAt: feature.updatedAt,
  };
}
