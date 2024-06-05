import { Decimal } from '@prisma/client/runtime/library';

export class ProductResponse {
  id: number;
  sku: string;
  name: string;
  price: Decimal;
  stock: number;
}

export type FindAllProductRequest = {
  sku?: string;
  name?: string;
  page: number;
  size: number;
};
