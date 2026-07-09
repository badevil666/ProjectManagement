import { z } from 'zod';
import { isoDateString } from './common';

export const shareLinkCreateSchema = z
  .object({
    expiresAt: isoDateString.nullable().optional(),
  })
  .strict();

export type ShareLinkCreateInput = z.infer<typeof shareLinkCreateSchema>;
