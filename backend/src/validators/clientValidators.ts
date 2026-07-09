import { z } from 'zod';
import { paginationQueryFields } from './common';

export const clientCreateSchema = z
  .object({
    companyName: z.string().min(1, 'companyName is required'),
    contactPerson: z.string().min(1, 'contactPerson is required'),
    email: z.string().email('Must be a valid email'),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    industry: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .strict();

export const clientUpdateSchema = clientCreateSchema.partial().strict();

export const clientListQuerySchema = z
  .object({
    ...paginationQueryFields,
    search: z.string().optional(),
  })
  .strict();

export const clientDeleteQuerySchema = z
  .object({
    force: z.enum(['true', 'false']).optional(),
  })
  .strict();

export type ClientCreateInput = z.infer<typeof clientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof clientUpdateSchema>;
export type ClientListQuery = z.infer<typeof clientListQuerySchema>;
