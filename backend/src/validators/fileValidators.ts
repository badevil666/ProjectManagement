import { z } from 'zod';
import { uuidParam } from './common';

export const fileListQuerySchema = z
  .object({
    moduleId: uuidParam.optional(),
  })
  .strict();
