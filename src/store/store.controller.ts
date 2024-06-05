import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { StoreService } from './store.service';
import { Roles } from '../common/roles.decorator';
import { FindAllStoreRequest, StoreResponse } from '../model/store.model';
import { Role } from '@prisma/client';
import { WebResponse } from '../model/web.model';
import { Auth } from '../common/auth.decorator';
import { User } from '../model/user.model';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@ApiCookieAuth()
@ApiTags('Store')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @Post()
  async create(
    @Auth() user: User,
    @Body() createStoreDto: CreateStoreDto,
  ): Promise<WebResponse<StoreResponse>> {
    const store = await this.storeService.create(user, createStoreDto);
    return {
      data: store,
    };
  }

  @Roles([Role.OWNER, Role.ADMIN, Role.CASHIER])
  @Get()
  findAll(
    @Auth() user: User,
    @Query('name') name?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<StoreResponse[]>> {
    const request: FindAllStoreRequest = {
      name: name,
      page: page || 1,
      size: size || 10,
    };

    return this.storeService.findAll(user, request);
  }

  @Roles([Role.OWNER, Role.ADMIN, Role.CASHIER])
  @Get(':storeId')
  async findOne(
    @Auth() user: User,
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<WebResponse<StoreResponse>> {
    const store = await this.storeService.findOne(storeId, user);
    return {
      data: store,
    };
  }

  @Roles([Role.OWNER])
  @Patch(':storeId')
  async update(
    @Auth() user: User,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<WebResponse<StoreResponse>> {
    const store = await this.storeService.update(storeId, user, updateStoreDto);
    return {
      data: store,
    };
  }

  @Roles([Role.OWNER])
  @Delete(':storeId')
  async remove(
    @Auth() user: User,
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<WebResponse<StoreResponse>> {
    const store = await this.storeService.remove(storeId, user);
    return {
      data: store,
    };
  }
}
