import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CartResponse } from '../model/cart.model';
import { User } from '../model/user.model';
import { Auth } from '../common/auth.decorator';
import { WebResponse } from '../model/web.model';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApiDetailResponse } from '../common/api-detail-response.decorator';
import { ApiListResponse } from '../common/api-list-response.decorator';

@ApiCookieAuth()
@ApiTags('Cart')
@Controller('stores/:storeId/carts')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  @ApiDetailResponse(CartResponse)
  async create(
    @Auth() user: User,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createCartDto: CreateCartDto,
  ): Promise<WebResponse<CartResponse>> {
    const cart = await this.cartService.create(storeId, user, createCartDto);
    return {
      data: cart,
    };
  }

  @ApiListResponse(CartResponse)
  @Get()
  findAll(@Auth() user: User, @Param('storeId', ParseIntPipe) storeId: number) {
    return this.cartService.findAll(storeId, user);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Auth() user: User,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() updateCartDto: UpdateCartDto,
  ) {
    return this.cartService.update(id, storeId, user, updateCartDto);
  }

  @Delete(':id')
  remove(
    @Param('id') id: number,
    @Auth() user: User,
    @Param('storeId', ParseIntPipe) storeId: number,
  ) {
    return this.cartService.remove(id, storeId, user);
  }
}
