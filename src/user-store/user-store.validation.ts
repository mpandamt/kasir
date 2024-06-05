import { Role } from '@prisma/client';
import { z, ZodType } from 'zod';

export class UserStoreValidation {
  static readonly CREATE: ZodType = z.object({
    email: z.string().email(),
    role: z.nativeEnum(Role),
  });

  static readonly UPDATE: ZodType = z.object({
    role: z.nativeEnum(Role),
  });

  static readonly FIND_ALL: ZodType = z.object({
    name: z.string().min(1).max(32).optional(),
    role: z.nativeEnum(Role).optional(),
    page: z.number().min(1).optional(),
    size: z.number().min(1).max(100).optional(),
  });
}
