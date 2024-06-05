import { FindAllOrderRequest } from './../model/order.model';
import { Controller, Post, Param, ParseIntPipe, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { User } from '../model/user.model';
import { Auth } from '../common/auth.decorator';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiCookieAuth()
@ApiTags('Order')
@Controller('stores/:storeId/orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Auth() user: User, @Param('storeId', ParseIntPipe) storeId: number) {
    return this.orderService.create(storeId, user);
  }

  @Get()
  findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    findAllOrderRequest: FindAllOrderRequest,
  ) {
    return this.orderService.findAll(storeId, findAllOrderRequest);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Param('storeId', ParseIntPipe) storeId: number,
  ) {
    return this.orderService.findOne(id, storeId);
  }
}
