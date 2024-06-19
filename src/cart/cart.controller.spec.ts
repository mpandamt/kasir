import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { User } from '../model/user.model';
import { CreateCartDto } from './dto/create-cart.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { CartResponse } from '../model/cart.model';
import { WebResponse } from '../model/web.model';
import { UpdateCartDto } from './dto/update-cart.dto';

const mockCartService = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [{ provide: CartService, useValue: mockCartService }],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a cart successfully', async () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const storeId = 1;
    const createCartDto: CreateCartDto = { productId: 10, quantity: 2 };
    const price = new Decimal(9.99);
    const expectedCart: CartResponse = {
      id: 1,
      ...createCartDto,
      name: 'Product Name',
      sku: 'ABC123',
      price,
      totalPrice: price.mul(createCartDto.quantity),
    };

    mockCartService.create.mockResolvedValueOnce(expectedCart);

    const response: WebResponse<CartResponse> = await controller.create(
      user,
      storeId,
      createCartDto,
    );

    expect(response.data).toEqual(expectedCart);
    expect(service.create).toHaveBeenCalledWith(storeId, user, createCartDto);
  });

  it('should handle errors from CartService.create()', async () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const storeId = 1;
    const createCartDto: CreateCartDto = { productId: 10, quantity: 2 };
    const error = new Error('Some error occurred');

    mockCartService.create.mockRejectedValueOnce(error);

    // Expect an error response with appropriate status code
    // (implementation depends on your error handling mechanism)
    await expect(
      controller.create(user, storeId, createCartDto),
    ).rejects.toThrow(error);

    expect(service.create).toHaveBeenCalledWith(storeId, user, createCartDto);
  });

  it('should retrieve all carts for a store and user', async () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const storeId = 1;
    const expectedCarts: WebResponse<CartResponse[]> = {
      data: [
        {
          id: 1,
          productId: 2,
          quantity: 1,
          name: 'Product 1', // Simulate product name retrieval (optional)
          sku: 'DEF456', // Simulate sku retrieval (optional)
          price: new Decimal(5.0), // Assuming price is a Decimal
          totalPrice: new Decimal(5.0),
        },
        {
          id: 2,
          productId: 3,
          quantity: 3,
          name: 'Product 2', // Simulate product name retrieval (optional)
          sku: 'GHI789', // Simulate sku retrieval (optional)
          price: new Decimal(10.99),
          totalPrice: new Decimal(32.97),
        },
      ],
    };

    mockCartService.findAll.mockResolvedValueOnce(expectedCarts);

    const response: WebResponse<CartResponse[]> = await controller.findAll(
      user,
      storeId,
    );

    // Assert expected response data
    expect(response).toEqual(expectedCarts);

    // Assert that CartService.findAll was called with correct arguments
    expect(service.findAll).toHaveBeenCalledWith(storeId, user);
  });

  it('should update a cart successfully', async () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const storeId = 1;
    const cartId = 2;
    const updateCartDto: UpdateCartDto = { quantity: 5 }; // Assuming only quantity can be updated
    const price = new Decimal(10.99);
    const expectedCart: CartResponse = {
      id: cartId,
      productId: 3, // Assuming product ID remains unchanged
      ...updateCartDto,
      name: 'Product 2', // Simulate product name retrieval (optional)
      sku: 'GHI789', // Simulate sku retrieval (optional)
      price,
      totalPrice: price.mul(updateCartDto.quantity),
    };

    mockCartService.update.mockResolvedValueOnce(expectedCart);

    const response: WebResponse<CartResponse> = await controller.update(
      cartId,
      user,
      storeId,
      updateCartDto,
    );

    expect(response.data).toEqual(expectedCart);
    expect(service.update).toHaveBeenCalledWith(
      cartId,
      storeId,
      user,
      updateCartDto,
    );
  });

  it('should handle errors from CartService.update()', async () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const storeId = 1;
    const cartId = 2;
    const updateCartDto: UpdateCartDto = { quantity: 5 };
    const error = new Error('Some error occurred');

    mockCartService.update.mockRejectedValueOnce(error);

    // Expect an error response with appropriate status code
    // (implementation depends on your error handling mechanism)
    await expect(
      controller.update(cartId, user, storeId, updateCartDto),
    ).rejects.toThrow(error);

    expect(service.update).toHaveBeenCalledWith(
      cartId,
      storeId,
      user,
      updateCartDto,
    );
  });

  it('should remove a cart successfully', async () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const storeId = 1;
    const cartId = 3;

    mockCartService.remove.mockResolvedValueOnce(undefined); // Assuming remove returns nothing

    const response: WebResponse<CartResponse> = await controller.remove(
      cartId,
      user,
      storeId,
    );

    expect(response.data).toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(cartId, storeId, user);
  });

  it('should handle errors from CartService.remove()', async () => {
    const user: User = {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
    };
    const storeId = 1;
    const cartId = 3;
    const error = new Error('Some error occurred');

    mockCartService.remove.mockRejectedValueOnce(error);

    await expect(controller.remove(cartId, user, storeId)).rejects.toThrow(
      error,
    );

    expect(service.remove).toHaveBeenCalledWith(cartId, storeId, user);
  });
});
