import { Role } from '@prisma/client';

export class CreateUserStoreDto {
  email: string;
  role: Role;
}
