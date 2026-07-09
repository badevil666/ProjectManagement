import { z } from 'zod';

/** Accepts any string that `Date.parse` can understand (date-only or full ISO datetime). */
export const isoDateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: 'Must be a valid date string',
});

/** Money field: string decimal, e.g. "1200.00" — per API_CONTRACT.md money convention. */
export const moneyString = z
  .string()
  .regex(/^-?\d+(\.\d{1,2})?$/, 'Must be a decimal string, e.g. "1200.00"');

/** estimatedHours accepts either a number or a numeric string from the client, stored as a string. */
export const hoursValue = z
  .union([
    z.string().regex(/^\d+(\.\d{1,2})?$/, 'Must be a decimal number'),
    z.number().nonnegative(),
  ])
  .transform((value) => String(value));

export const uuidParam = z.string().uuid('Must be a valid UUID');

export const orderBodySchema = z
  .object({
    order: z.array(uuidParam).min(1, 'order must contain at least one id'),
  })
  .strict();

/** Shared page/limit fields, spread into each resource's list-query schema. */
export const paginationQueryFields = {
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional(),
};
