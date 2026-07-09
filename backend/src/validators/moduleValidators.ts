import { z } from 'zod';
import { hoursValue } from './common';

const moduleStatusEnum = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED']);

export const moduleCreateSchema = z
  .object({
    title: z.string().min(1, 'title is required'),
    description: z.string().nullable().optional(),
    estimatedHours: hoursValue.nullable().optional(),
  })
  .strict();

export const moduleUpdateSchema = moduleCreateSchema.partial().strict();

export const moduleStatusSchema = z
  .object({
    status: moduleStatusEnum,
  })
  .strict();

export type ModuleCreateInput = z.infer<typeof moduleCreateSchema>;
export type ModuleUpdateInput = z.infer<typeof moduleUpdateSchema>;
