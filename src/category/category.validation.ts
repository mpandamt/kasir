import { z, ZodType } from 'zod';

export class CategoryValidation {
  static readonly CREATE: ZodType = z.object({
    storeId: z.number().positive(),
    name: z.string().min(1).max(64),
    isDelete: z.boolean().default(false),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    storeId: z.number().positive(),
    name: z.string().min(1).max(64).optional(),
    isDelete: z.boolean().default(false),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().positive(),
    storeId: z.number().positive(),
  });

  static readonly FIND_ALL: ZodType = z.object({
    storeId: z.number().positive(),
    name: z.string().min(1).max(64).optional(),
    page: z.number().min(1).optional(),
    size: z.number().min(1).max(100).optional(),
  });
}
