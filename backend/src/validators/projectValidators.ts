import { z } from 'zod';
import { isoDateString, moneyString, paginationQueryFields, uuidParam } from './common';

const projectStatusEnum = z.enum(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']);
const projectPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);

export const projectCreateSchema = z
  .object({
    clientId: uuidParam,
    title: z.string().min(1, 'title is required'),
    description: z.string().nullable().optional(),
    status: projectStatusEnum.optional(),
    priority: projectPriorityEnum.optional(),
    startDate: isoDateString.nullable().optional(),
    expectedEndDate: isoDateString.nullable().optional(),
    budget: moneyString.nullable().optional(),
    currency: z.string().length(3, 'currency must be a 3-letter ISO code').optional(),
  })
  .strict();

export const projectUpdateSchema = z
  .object({
    clientId: uuidParam.optional(),
    title: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    status: projectStatusEnum.optional(),
    priority: projectPriorityEnum.optional(),
    startDate: isoDateString.nullable().optional(),
    expectedEndDate: isoDateString.nullable().optional(),
    actualEndDate: isoDateString.nullable().optional(),
    budget: moneyString.nullable().optional(),
    currency: z.string().length(3).optional(),
  })
  .strict();

export const projectListQuerySchema = z
  .object({
    ...paginationQueryFields,
    status: projectStatusEnum.optional(),
    clientId: uuidParam.optional(),
    search: z.string().optional(),
  })
  .strict();

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>;
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;
