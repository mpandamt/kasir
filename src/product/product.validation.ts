import { z, ZodType } from 'zod';

export class ProductValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string().min(1).max(64),
    sku: z.string().min(1).max(128),
    price: z.number().positive().min(0),
    stock: z.number().positive(),
    isDeleted: z.boolean().default(false),
  });

  static readonly UPDATE: ZodType = z.object({
    name: z.string().min(1).max(64),
    sku: z.string().min(1).max(128),
    price: z.number().positive().min(0),
    stock: z.number().positive(),
    isDeleted: z.boolean().default(false),
  });

  static readonly REMOVE: ZodType = z.object({
    id: z.number().positive(),
    storeId: z.number().positive(),
  });

  static readonly FIND_ALL: ZodType = z.object({
    sku: z.string().optional(),
    name: z.string().min(1).max(64).optional(),
    page: z.number().min(1).optional(),
    size: z.number().min(1).max(100).optional(),
  });

  static readonly FIND_ONE: ZodType = z.object({
    sku: z.string().optional(),
    name: z.string().min(1).max(64).optional(),
    page: z.number().min(1).optional(),
    size: z.number().min(1).max(100).optional(),
  });
}
