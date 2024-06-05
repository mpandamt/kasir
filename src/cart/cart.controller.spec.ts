import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { User } from '../model/user.model';
import { CreateCartDto } from './dto/create-cart.dto';

describe('CartController', () => {
  let controller: CartController;
  let service: CartService;
  const mockUserService = {
    create: jest.fn(async (user, storeId, createCartDto) => {
      return {
        id: 1,
        productId: createCartDto.productId,
        name: 'name',
        sku: 'sku',
        quantity: createCartDto.quantity,
        price: 10000,
        totalPrice: 10000 * createCartDto.quantity,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [CartService],
    })
      .overrideProvider(CartService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Reset mocks after each test
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a cart', async () => {
    const user: User = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
    };
    const storeId = 1;
    const createCartDto: CreateCartDto = {
      productId: 1,
      quantity: 10,
    };

    const result = await controller.create(user, storeId, createCartDto);

    expect(result).toEqual({
      data: {
        id: expect.any(Number),
        productId: createCartDto.productId,
        name: expect.any(String),
        sku: expect.any(String),
        quantity: createCartDto.quantity,
        price: expect.any(Number),
        totalPrice: expect.any(Number),
      },
    });
    expect(service.create).toHaveBeenCalledWith(storeId, user, createCartDto);
  });
});
