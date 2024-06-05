import { Role } from '@prisma/client';

export class UserStoreResponse {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export type FindAllUserStoreRequest = {
  name?: string;
  role?: Role;
  page: number;
  size: number;
};
