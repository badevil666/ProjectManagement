import { z } from 'zod';

export const sendCompletionEmailSchema = z
  .object({
    kind: z.enum(['MODULE', 'FEATURE', 'PROJECT']),
    moduleId: z.string().uuid().optional(),
    featureId: z.string().uuid().optional(),
    recipients: z.array(z.string().email()).min(1, 'Select at least one recipient'),
  })
  .strict()
  .refine((value) => value.kind !== 'MODULE' || Boolean(value.moduleId), {
    message: 'moduleId is required when kind is MODULE',
    path: ['moduleId'],
  })
  .refine((value) => value.kind !== 'FEATURE' || Boolean(value.featureId), {
    message: 'featureId is required when kind is FEATURE',
    path: ['featureId'],
  });

export type SendCompletionEmailInput = z.infer<typeof sendCompletionEmailSchema>;
