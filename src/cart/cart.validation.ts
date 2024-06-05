import { z, ZodType } from 'zod';

export class CartValidation {
  static readonly CREATE: ZodType = z.object({
    productId: z.number().positive(),
    quantity: z.number().positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    quantity: z.number().positive(),
  });

  static readonly FIND_ALL: ZodType = z.object({
    storeId: z.number().positive(),
    name: z.string().min(1).max(64).optional(),
    page: z.number().min(1).optional(),
    size: z.number().min(1).max(100).optional(),
  });
}
