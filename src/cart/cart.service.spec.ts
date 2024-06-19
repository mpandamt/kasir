import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaClient, Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { NotFoundException } from '@nestjs/common';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { User } from 'src/model/user.model';
import { CreateCartDto } from './dto/create-cart.dto';
import { CartResponse } from 'src/model/cart.model';
import { UpdateCartDto } from './dto/update-cart.dto';

describe('CartService', () => {
  let cartService: CartService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        ValidationService,
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkProductMustExists', () => {
    it('should return product if it exists', async () => {
      const existingProduct: Product = {
        id: 1,
        storeId: 1,
        name: 'Product name',
        sku: 'Product1',
        price: new Decimal(99.9),
        stock: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.product.findFirst.mockResolvedValueOnce(existingProduct);

      const result = await cartService.checkProductMustExists(
        existingProduct.id,
        existingProduct.storeId,
      );
      expect(result).toEqual(existingProduct);
      expect(prismaMock.product.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
        where: {
          id: existingProduct.id,
          storeId: existingProduct.storeId,
          isDeleted: false,
        },
      });
    });

    it('should throw NotFoundException if product not exists', async () => {
      const productId = 1;
      const storeId = 1;
      prismaMock.product.findFirst.mockResolvedValue(null);

      await expect(
        cartService.checkProductMustExists(productId, storeId),
      ).rejects.toThrow(NotFoundException);
      expect(prismaMock.product.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
        where: { id: productId, storeId: storeId, isDeleted: false },
      });
    });
  });

  describe('Create Cart', () => {
    it('should create a cart if cart with product is not exists', async () => {
      const createCartDto: CreateCartDto = {
        productId: 1,
        quantity: 1,
      };
      const storeId = 1;
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@doe.com',
      };

      const existingProduct: Product = {
        id: 1,
        storeId: 1,
        name: 'Product name',
        sku: 'Product1',
        price: new Decimal(99.9),
        stock: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createCart = {
        id: 1,
        storeId,
        userId: user.id,
        quantity: createCartDto.quantity,
        productId: existingProduct.id,
        product: existingProduct,
      };

      const expectedResponse: CartResponse = {
        id: createCart.id,
        productId: existingProduct.id,
        name: existingProduct.name,
        sku: existingProduct.sku,
        quantity: createCartDto.quantity,
        price: existingProduct.price,
        totalPrice: existingProduct.price.mul(createCartDto.quantity),
      };

      prismaMock.product.findFirst.mockResolvedValueOnce(existingProduct);
      prismaMock.cart.findFirst.mockResolvedValueOnce(null);
      prismaMock.cart.create.mockResolvedValueOnce(createCart);

      jest.spyOn(cartService, 'checkProductMustExists');

      const result = await cartService.create(storeId, user, createCartDto);
      expect(result).toEqual(expectedResponse);
      expect(cartService.checkProductMustExists).toHaveBeenCalled();
      expect(prismaMock.cart.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.cart.create).toHaveBeenCalledWith({
        data: {
          storeId,
          userId: user.id,
          quantity: createCartDto.quantity,
          productId: existingProduct.id,
        },
        include: {
          product: true,
        },
      });
      expect(prismaMock.product.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
        where: {
          id: existingProduct.id,
          storeId: storeId,
          isDeleted: false,
        },
      });
    });

    it('should add a quantity if cart with product exists', async () => {
      const createCartDto: CreateCartDto = {
        productId: 1,
        quantity: 1,
      };
      const storeId = 1;
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@doe.com',
      };

      const existingProduct: Product = {
        id: 1,
        storeId: 1,
        name: 'Product name',
        sku: 'Product1',
        price: new Decimal(99.9),
        stock: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existsCart = {
        id: 1,
        storeId,
        userId: user.id,
        quantity: 5,
        productId: existingProduct.id,
        product: existingProduct,
      };

      const updateCart = {
        ...existsCart,
        quantity: existsCart.quantity + createCartDto.quantity,
      };

      const expectedResponse: CartResponse = {
        id: existsCart.id,
        productId: existingProduct.id,
        name: existingProduct.name,
        sku: existingProduct.sku,
        quantity: createCartDto.quantity + existsCart.quantity,
        price: existingProduct.price,
        totalPrice: existingProduct.price.mul(
          createCartDto.quantity + existsCart.quantity,
        ),
      };

      prismaMock.product.findFirst.mockResolvedValueOnce(existingProduct);
      prismaMock.cart.findFirst.mockResolvedValueOnce(existsCart);
      prismaMock.cart.update.mockResolvedValueOnce(updateCart);

      jest.spyOn(cartService, 'checkProductMustExists');

      const result = await cartService.create(storeId, user, createCartDto);
      expect(result).toEqual(expectedResponse);
      expect(cartService.checkProductMustExists).toHaveBeenCalled();
      expect(prismaMock.cart.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.cart.update).toHaveBeenCalledWith({
        data: {
          quantity: createCartDto.quantity + existsCart.quantity,
        },
        where: {
          id: existsCart.id,
        },
        include: {
          product: true,
        },
      });
      expect(cartService.checkProductMustExists).toHaveBeenCalled();
      expect(prismaMock.product.findFirst).toHaveBeenCalledTimes(1);
      expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
        where: {
          id: existingProduct.id,
          storeId: storeId,
          isDeleted: false,
        },
      });
    });

    it('should throw error if product quantity is not enough and cart not exists', async () => {
      const createCartDto: CreateCartDto = {
        productId: 1,
        quantity: 11,
      };
      const storeId = 1;
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@doe.com',
      };

      const existingProduct: Product = {
        id: 1,
        storeId: 1,
        name: 'Product name',
        sku: 'Product1',
        price: new Decimal(99.9),
        stock: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const createCart = {
        id: 1,
        storeId,
        userId: user.id,
        quantity: createCartDto.quantity,
        productId: existingProduct.id,
        product: existingProduct,
      };

      prismaMock.product.findFirst.mockResolvedValueOnce(existingProduct);
      prismaMock.cart.findFirst.mockResolvedValueOnce(null);
      prismaMock.cart.create.mockResolvedValueOnce(createCart);

      jest.spyOn(cartService, 'checkProductMustExists');

      await expect(
        cartService.create(storeId, user, createCartDto),
      ).rejects.toThrow('Product stock is not enough');
      expect(cartService.checkProductMustExists).toHaveBeenCalled();
    });

    it('should throw error if product quantity is not enough and cart exists', async () => {
      const createCartDto: CreateCartDto = {
        productId: 1,
        quantity: 6,
      };
      const storeId = 1;
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@doe.com',
      };

      const existingProduct: Product = {
        id: 1,
        storeId: 1,
        name: 'Product name',
        sku: 'Product1',
        price: new Decimal(99.9),
        stock: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existsCart = {
        id: 1,
        storeId,
        userId: user.id,
        quantity: 5,
        productId: existingProduct.id,
        product: existingProduct,
      };

      const updateCart = {
        ...existsCart,
        quantity: existsCart.quantity + createCartDto.quantity,
      };

      prismaMock.product.findFirst.mockResolvedValueOnce(existingProduct);
      prismaMock.cart.findFirst.mockResolvedValueOnce(existsCart);
      prismaMock.cart.update.mockResolvedValueOnce(updateCart);

      jest.spyOn(cartService, 'checkProductMustExists');

      await expect(
        cartService.create(storeId, user, createCartDto),
      ).rejects.toThrow('Product stock is not enough');
      expect(cartService.checkProductMustExists).toHaveBeenCalled();
    });
  });

  describe('Find all carts', () => {
    it('should return all cart list', async () => {
      const storeId = 1;
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@doe.com',
      };

      const product: Product = {
        id: 1,
        storeId: 1,
        name: 'Product name',
        sku: 'Product1',
        price: new Decimal(99.9),
        stock: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFindAll = [
        {
          id: 1,
          storeId,
          userId: user.id,
          productId: product.id,
          quantity: 5,
          product: product,
        },
      ];
      const expectedResponse = {
        data: mockFindAll.map((cartItem) => ({
          id: cartItem.id,
          productId: cartItem.productId,
          name: cartItem.product.name,
          sku: cartItem.product.sku,
          quantity: cartItem.quantity,
          price: cartItem.product.price,
          totalPrice: cartItem.product.price.mul(cartItem.quantity),
        })),
      };

      prismaMock.cart.findMany.mockResolvedValueOnce(mockFindAll);

      const result = await cartService.findAll(storeId, user);
      expect(result).toEqual(expectedResponse);
      expect(prismaMock.cart.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('Update cart', () => {
    it('should update cart item', async () => {
      const updateCartDto: UpdateCartDto = {
        quantity: 1,
      };
      const storeId = 1;
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@doe.com',
      };

      const existingProduct: Product = {
        id: 1,
        storeId: 1,
        name: 'Product name',
        sku: 'Product1',
        price: new Decimal(99.9),
        stock: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cart = {
        id: 1,
        storeId,
        userId: user.id,
        quantity: updateCartDto.quantity,
        productId: existingProduct.id,
        product: existingProduct,
      };

      const expectedResponse: CartResponse = {
        id: cart.id,
        productId: existingProduct.id,
        name: existingProduct.name,
        sku: existingProduct.sku,
        quantity: updateCartDto.quantity,
        price: existingProduct.price,
        totalPrice: existingProduct.price.mul(updateCartDto.quantity),
      };

      prismaMock.cart.findFirst.mockResolvedValueOnce(cart);
      prismaMock.cart.update.mockResolvedValueOnce(cart);

      const result = await cartService.update(
        cart.id,
        storeId,
        user,
        updateCartDto,
      );
      expect(result).toEqual(expectedResponse);
      expect(prismaMock.cart.update).toHaveBeenCalledWith({
        where: {
          id: cart.id,
          storeId,
          userId: user.id,
        },
        data: {
          quantity: updateCartDto.quantity,
        },
        include: {
          product: true,
        },
      });
    });
  });

  describe('delete cart', () => {
    it('should delete cart item', async () => {
      const storeId = 1;
      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@doe.com',
      };

      const existingProduct: Product = {
        id: 1,
        storeId: 1,
        name: 'Product name',
        sku: 'Product1',
        price: new Decimal(99.9),
        stock: 10,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cart = {
        id: 1,
        storeId,
        userId: user.id,
        quantity: 1,
        productId: existingProduct.id,
        product: existingProduct,
      };

      const expectedResponse: CartResponse = {
        id: cart.id,
        productId: existingProduct.id,
        name: existingProduct.name,
        sku: existingProduct.sku,
        quantity: 1,
        price: existingProduct.price,
        totalPrice: existingProduct.price.mul(1),
      };

      prismaMock.cart.delete.mockResolvedValueOnce(cart);

      const result = await cartService.remove(cart.id, storeId, user);
      expect(result).toEqual(expectedResponse);
      expect(prismaMock.cart.delete).toHaveBeenCalledWith({
        where: {
          id: cart.id,
          storeId,
          userId: user.id,
        },
        include: {
          product: true,
        },
      });
    });
  });
});
