import { z, ZodType } from 'zod';

export class AuthValidation {
  static readonly REGISTER: ZodType = z.object({
    password: z.string().min(6).max(32),
    name: z.string().min(4).max(128),
    email: z.string().email(),
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().email(),
    password: z.string().min(6).max(32),
  });
}
