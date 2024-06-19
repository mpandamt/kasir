import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { CartResponse } from '../model/cart.model';
import { CartValidation } from './cart.validation';
import { Product } from '@prisma/client';
import { User } from '../model/user.model';
import { WebResponse } from '../model/web.model';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async checkProductMustExists(
    productId: number,
    storeId: number,
  ): Promise<Product> {
    const product = await this.prismaService.product.findFirst({
      where: {
        id: productId,
        storeId: storeId,
        isDeleted: false,
      },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(
    storeId: number,
    user: User,
    createCartDto: CreateCartDto,
  ): Promise<CartResponse> {
    const request: CreateCartDto = this.validationService.validate(
      CartValidation.CREATE,
      createCartDto,
    );
    const product = await this.checkProductMustExists(
      request.productId,
      storeId,
    );

    let cart = await this.prismaService.cart.findFirst({
      where: {
        storeId: storeId,
        userId: user.id,
        productId: request.productId,
      },
      include: {
        product: true,
      },
    });
    if (cart) {
      const quantity = request.quantity + cart.quantity;
      if (product.stock < quantity) {
        throw new HttpException('Product stock is not enough', 400);
      }

      cart = await this.prismaService.cart.update({
        where: {
          id: cart.id,
        },
        data: { quantity },
        include: {
          product: true,
        },
      });
    } else {
      const quantity = request.quantity;
      if (product.stock < quantity) {
        throw new HttpException('Product stock is not enough', 400);
      }

      cart = await this.prismaService.cart.create({
        data: {
          ...request,
          userId: user.id,
          storeId,
        },
        include: {
          product: true,
        },
      });
    }

    return {
      id: cart.id,
      productId: cart.productId,
      name: cart.product.name,
      sku: cart.product.sku,
      quantity: cart.quantity,
      price: cart.product.price,
      totalPrice: cart.product.price.mul(cart.quantity),
    };
  }

  async findAll(
    storeId: number,
    user: User,
  ): Promise<WebResponse<CartResponse[]>> {
    const carts = await this.prismaService.cart.findMany({
      where: {
        userId: user.id,
        storeId: storeId,
        product: {
          isDeleted: false,
        },
      },
      include: {
        product: true,
      },
    });

    return {
      data: carts.map((cart) => ({
        id: cart.id,
        productId: cart.productId,
        name: cart.product.name,
        sku: cart.product.sku,
        quantity: cart.quantity,
        price: cart.product.price,
        totalPrice: cart.product.price.mul(cart.quantity),
      })),
    };
  }

  async update(
    id: number,
    storeId: number,
    user: User,
    updateCartDto: UpdateCartDto,
  ): Promise<CartResponse> {
    const request: UpdateCartDto = this.validationService.validate(
      CartValidation.UPDATE,
      updateCartDto,
    );

    const cartItem = await this.prismaService.cart.findFirst({
      where: {
        id,
        storeId,
        userId: user.id,
      },
      include: {
        product: true,
      },
    });
    if (!cartItem) {
      throw new HttpException('Cart not found', 404);
    }
    if (cartItem.product.stock < request.quantity) {
      throw new HttpException('Product stock is not enough', 400);
    }

    const cart = await this.prismaService.cart.update({
      where: {
        id,
        storeId,
        userId: user.id,
      },
      data: {
        quantity: request.quantity,
      },
      include: {
        product: true,
      },
    });

    return {
      id: cart.id,
      productId: cart.productId,
      name: cart.product.name,
      sku: cart.product.sku,
      quantity: cart.quantity,
      price: cart.product.price,
      totalPrice: cart.product.price.mul(cart.quantity),
    };
  }

  async remove(id: number, storeId: number, user: User): Promise<CartResponse> {
    const cart = await this.prismaService.cart.delete({
      where: {
        id,
        storeId,
        userId: user.id,
      },
      include: {
        product: true,
      },
    });
    return {
      id: cart.id,
      productId: cart.productId,
      name: cart.product.name,
      sku: cart.product.sku,
      quantity: cart.quantity,
      price: cart.product.price,
      totalPrice: cart.product.price.mul(cart.quantity),
    };
  }
}
