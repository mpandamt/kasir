import { z, ZodType } from 'zod';

export class StoreValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(32),
    isDelete: z.boolean().default(false),
    userId: z.number().positive(),
  });

  static readonly FIND_ONE: ZodType = z.object({
    id: z.number().positive(),
    userId: z.number().positive(),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    userId: z.number().positive(),
    name: z.string().min(1).max(32).optional(),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().positive(),
    userId: z.number().positive(),
  });

  static readonly FIND_ALL: ZodType = z.object({
    userId: z.number().positive(),
    name: z.string().min(1).max(32).optional(),
    page: z.number().min(1).optional(),
    size: z.number().min(1).max(100).optional(),
  });
}
