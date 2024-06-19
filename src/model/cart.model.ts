import { Decimal } from '@prisma/client/runtime/library';

export class CartResponse {
  id: number;
  productId: number;
  name: string;
  sku: string;
  quantity: number;
  price: Decimal;
  totalPrice: Decimal;
}
