import { z } from 'zod';

export const adminCommentCreateSchema = z
  .object({
    message: z.string().min(1, 'message is required'),
  })
  .strict();

export const clientCommentCreateSchema = z
  .object({
    authorName: z.string().min(1, 'authorName is required').max(120),
    message: z.string().min(1, 'message is required'),
  })
  .strict();

export type AdminCommentCreateInput = z.infer<typeof adminCommentCreateSchema>;
export type ClientCommentCreateInput = z.infer<typeof clientCommentCreateSchema>;
