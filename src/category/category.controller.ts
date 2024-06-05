import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  Query,
  Delete,
  Put,
  HttpCode,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { CategoryResponse } from '../model/category.model';
import { WebResponse } from '../model/web.model';
import { ApiCookieAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@ApiCookieAuth()
@ApiTags('Category')
@Controller('/stores/:storeId/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @Roles([Role.ADMIN, Role.OWNER])
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createCategoryDto: CreateCategoryDto,
  ): Promise<WebResponse<CategoryResponse>> {
    const category = await this.categoryService.create(
      storeId,
      createCategoryDto,
    );
    return {
      data: category,
    };
  }

  @Get()
  @ApiQuery({ name: 'name', required: false })
  @Roles([Role.ADMIN, Role.OWNER])
  async findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('name') name?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<CategoryResponse[]>> {
    return this.categoryService.findAll(storeId, {
      name,
      page: page || 1,
      size: size || 10,
    });
  }

  @Put('/:id')
  @HttpCode(200)
  @Roles([Role.ADMIN])
  async update(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<WebResponse<CategoryResponse>> {
    const category = await this.categoryService.update(
      id,
      storeId,
      updateCategoryDto,
    );

    return {
      data: category,
    };
  }

  @Delete('/:id')
  @Roles([Role.ADMIN])
  async delete(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<CategoryResponse>> {
    const category = await this.categoryService.remove(id, storeId);

    return {
      data: category,
    };
  }
}
