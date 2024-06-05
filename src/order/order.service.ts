import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { User } from '../model/user.model';
import { FindAllOrderRequest, OrderResponse } from '../model/order.model';
import { OrderValidation } from './order.validation';

@Injectable()
export class OrderService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(storeId: number, user: User): Promise<OrderResponse> {
    const result = await this.prismaService.$transaction(async (tx) => {
      const filters = [
        {
          userId: user.id,
          storeId,
        },
      ];

      const cartItems = await tx.cart.findMany({
        where: {
          AND: filters,
        },
        include: {
          product: true,
        },
      });

      if (cartItems.length == 0) {
        throw new HttpException('Please add a cart items', 400);
      }

      let total = 0;
      const products = await Promise.all(
        cartItems.map(async (cartItem) => {
          const product = await tx.product.update({
            where: {
              id: cartItem.productId,
            },
            data: {
              stock: {
                decrement: cartItem.quantity,
              },
            },
          });
          if (product.stock < 0) {
            throw new HttpException(
              `Product ${cartItem.product.name} stock is not enough`,
              400,
            );
          }

          const totalPrice = Number(cartItem.product.price) * cartItem.quantity;
          total += totalPrice;
          return {
            productId: cartItem.product.id,
            name: cartItem.product.name,
            sku: cartItem.product.sku,
            price: cartItem.product.price,
            quantity: cartItem.quantity,
            totalPrice: totalPrice,
          };
        }),
      );

      await tx.cart.deleteMany({
        where: {
          AND: filters,
        },
      });

      return tx.order.create({
        data: {
          userId: user.id,
          storeId,
          total,
          OrderItems: {
            create: products,
          },
        },
        include: {
          store: true,
          user: true,
          OrderItems: true,
        },
      });
    });

    return {
      id: result.id,
      createdAt: result.createdAt,
      total: result.total,
      cashierName: result.user.name,
      storeName: result.store.name,
      orderItems: result.OrderItems,
    };
  }

  async findAll(storeId: number, findAllorderRequest: FindAllOrderRequest) {
    const request: FindAllOrderRequest = this.validationService.validate(
      OrderValidation.FIND_ALL,
      findAllorderRequest,
    );

    const filters: any = [
      {
        storeId: storeId,
      },
    ];

    const skip = (request.page - 1) * request.size;

    const [orders, total] = await Promise.all([
      this.prismaService.order.findMany({
        where: {
          AND: filters,
        },
        skip,
        take: request.size,
      }),
      this.prismaService.product.count({
        where: {
          AND: filters,
        },
      }),
    ]);

    return {
      data: orders,
      paging: {
        currentPage: request.page,
        size: request.size,
        totalPage: Math.ceil(total / request.size),
      },
    };
  }

  async findOne(id: number, storeId: number) {
    const order = await this.prismaService.order.findFirst({
      where: {
        id,
        storeId,
      },
    });
    if (!order) {
      throw new HttpException('order not found', 404);
    }
    return order;
  }
}
