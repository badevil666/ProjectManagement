import { z } from 'zod';

export const dashboardActivityQuerySchema = z
  .object({
    limit: z.string().regex(/^\d+$/).optional(),
  })
  .strict();
