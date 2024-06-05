import { Decimal } from '@prisma/client/runtime/library';

export class OrderResponse {
  id: number;
  createdAt: Date;
  total: Decimal;
  cashierName: string;
  storeName: string;
  orderItems: OrderItem[];
}

export type OrderItem = {
  id: number;
  name: string;
  sku: string;
  quantity: number;
  price: Decimal;
  totalPrice: Decimal;
};

export type FindAllOrderRequest = {
  page: number;
  size: number;
};
