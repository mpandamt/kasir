import { z, ZodType } from 'zod';

export class OrderValidation {
  static readonly FIND_ALL: ZodType = z.object({
    page: z.number().min(1).optional(),
    size: z.number().min(1).max(100).optional(),
  });
}
