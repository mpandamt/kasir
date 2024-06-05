import { Roles } from './../common/roles.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { Auth } from '../common/auth.decorator';
import { UserStoreResponse } from '../model/user-store.model';
import { WebResponse } from '../model/web.model';
import { UserStoreService } from './user-store.service';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreateUserStoreDto } from './dto/create-user-store.dto';
import { UpdateUserStoreDto } from './dto/update-user-store.dto';

@ApiCookieAuth()
@ApiTags('User store')
@Controller('stores/:storeId/users')
export class UserStoreController {
  constructor(private readonly userStoreService: UserStoreService) {}

  @Get('/')
  @Roles([...Object.values(Role)])
  async findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('name') name?: string,
    @Query('role') role?: Role,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<UserStoreResponse[]>> {
    const request = {
      name,
      role,
      page: page || 1,
      size: size || 10,
    };
    return this.userStoreService.findAll(storeId, request);
  }

  @Roles([Role.ADMIN, Role.OWNER])
  @Post()
  async create(
    @Auth() user: User,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createUserStoreDto: CreateUserStoreDto,
  ): Promise<WebResponse<UserStoreResponse>> {
    const userStore = await this.userStoreService.create(
      user,
      storeId,
      createUserStoreDto,
    );
    return {
      data: userStore,
    };
  }

  @Roles([Role.ADMIN, Role.OWNER])
  @Patch(':id')
  async update(
    @Auth() user: User,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserStoreDto: UpdateUserStoreDto,
  ): Promise<WebResponse<UserStoreResponse>> {
    const userStore = await this.userStoreService.update(
      id,
      user,
      storeId,
      updateUserStoreDto,
    );
    return {
      data: userStore,
    };
  }

  @Roles([Role.ADMIN, Role.OWNER])
  @Delete(':id')
  async remove(
    @Auth() user: User,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<UserStoreResponse>> {
    const userStore = await this.userStoreService.remove(id, user, storeId);
    return {
      data: userStore,
    };
  }
}
