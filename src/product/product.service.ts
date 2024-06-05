import { HttpException, Injectable } from '@nestjs/common';
import { FindAllProductRequest, ProductResponse } from '../model/product.model';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { ProductValidation } from './Product.validation';
import { WebResponse } from '../model/web.model';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
@Injectable()
export class ProductService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(
    storeId: number,
    createProductDto: CreateProductDto,
  ): Promise<ProductResponse> {
    const request: CreateProductDto = this.validationService.validate(
      ProductValidation.CREATE,
      createProductDto,
    );
    const isProductWithSkuExists = await this.prismaService.product.count({
      where: {
        storeId,
        sku: request.sku,
        isDeleted: false,
      },
    });

    if (isProductWithSkuExists > 0) {
      console.log({
        isProductWithSkuExists: 'Product with SKU already exists',
      });

      throw new HttpException('Product with SKU already exists', 400);
    }

    const product = await this.prismaService.product.create({
      data: {
        ...request,
        storeId,
      },
    });
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      price: product.price,
    };
  }

  async findAll(
    storeId: number,
    findAllProductRequest: FindAllProductRequest,
  ): Promise<WebResponse<ProductResponse[]>> {
    const request: FindAllProductRequest = this.validationService.validate(
      ProductValidation.FIND_ALL,
      findAllProductRequest,
    );

    const filters: any = [
      {
        isDeleted: false,
        storeId: storeId,
      },
    ];
    if (request.name) {
      filters.push({
        name: {
          contains: request.name,
        },
      });
    }
    if (request.sku) {
      filters.push({
        sku: request.sku,
      });
    }

    const skip = (request.page - 1) * request.size;

    const [products, total] = await Promise.all([
      this.prismaService.product.findMany({
        where: {
          AND: filters,
        },
        select: {
          id: true,
          name: true,
          stock: true,
          price: true,
          sku: true,
        },
        skip,
        take: request.size,
      }),
      this.prismaService.product.count({
        where: {
          AND: filters,
        },
      }),
    ]);

    return {
      data: products,
      paging: {
        currentPage: request.page,
        size: request.size,
        totalPage: Math.ceil(total / request.size),
      },
    };
  }

  async findOne(sku: string, storeId: number): Promise<ProductResponse> {
    const product = await this.prismaService.product.findFirst({
      where: {
        sku,
        storeId,
        isDeleted: false,
      },
    });
    if (!product) {
      throw new HttpException('Product not found', 404);
    }
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      price: product.price,
    };
  }

  async update(
    id: number,
    storeId: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse> {
    const request: UpdateProductDto = this.validationService.validate(
      ProductValidation.UPDATE,
      updateProductDto,
    );

    const product = await this.prismaService.product.update({
      where: {
        id: id,
        storeId,
        isDeleted: false,
        store: { isDeleted: false },
      },
      data: request,
    });
    if (!product) {
      throw new HttpException('Product not found', 404);
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      price: product.price,
    };
  }

  async remove(id: number, storeId: number): Promise<ProductResponse> {
    const product = await this.prismaService.product.update({
      where: {
        id,
        storeId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
      },
    });

    if (!product) {
      throw new HttpException('Product not found', 404);
    }

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      stock: product.stock,
      price: product.price,
    };
  }
}
