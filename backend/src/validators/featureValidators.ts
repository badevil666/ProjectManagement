import { z } from 'zod';
import { hoursValue } from './common';

const featurePriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
const featureStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED']);

export const featureCreateSchema = z
  .object({
    title: z.string().min(1, 'title is required'),
    description: z.string().nullable().optional(),
    priority: featurePriorityEnum.optional(),
    estimatedHours: hoursValue.nullable().optional(),
  })
  .strict();

export const featureUpdateSchema = featureCreateSchema.partial().strict();

export const featureStatusSchema = z
  .object({
    status: featureStatusEnum,
  })
  .strict();

export type FeatureCreateInput = z.infer<typeof featureCreateSchema>;
export type FeatureUpdateInput = z.infer<typeof featureUpdateSchema>;
