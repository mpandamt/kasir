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
import { ProductService } from './product.service';
import { Roles } from '../common/roles.decorator';
import { Role } from '@prisma/client';
import { FindAllProductRequest, ProductResponse } from '../model/product.model';
import { WebResponse } from '../model/web.model';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@ApiCookieAuth()
@ApiTags('Product')
@Controller('stores/:storeId/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Roles([Role.ADMIN, Role.OWNER])
  @Post()
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createProductDto: CreateProductDto,
  ): Promise<WebResponse<ProductResponse>> {
    const product = await this.productService.create(storeId, createProductDto);
    return {
      data: product,
    };
  }

  @Get()
  @Roles(Object.values(Role))
  findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('name') name?: string,
    @Query('sku') sku?: string,
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('size', new ParseIntPipe({ optional: true })) size?: number,
  ): Promise<WebResponse<ProductResponse[]>> {
    const request: FindAllProductRequest = {
      name,
      sku,
      page: page || 1,
      size: size || 10,
    };
    return this.productService.findAll(storeId, request);
  }

  @Get(':sku')
  async findOne(
    @Param('sku') sku: string,
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<WebResponse<ProductResponse>> {
    const product = await this.productService.findOne(sku, storeId);
    return {
      data: product,
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<WebResponse<ProductResponse>> {
    const product = await this.productService.update(
      id,
      storeId,
      updateProductDto,
    );
    return {
      data: product,
    };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Param('storeId', ParseIntPipe) storeId: number,
  ): Promise<WebResponse<ProductResponse>> {
    const product = await this.productService.remove(id, storeId);
    return {
      data: product,
    };
  }
}
