import { FindAllCategoryRequest } from './../model/category.model';
import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { CategoryResponse } from '../model/category.model';
import { CategoryValidation } from './category.validation';
import { Category } from '@prisma/client';
import { WebResponse } from '../model/web.model';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  toCategoryResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
    };
  }

  async create(
    storeId: number,
    request: CreateCategoryDto,
  ): Promise<CategoryResponse> {
    const createRequest: CreateCategoryDto = this.validationService.validate(
      CategoryValidation.CREATE,
      request,
    );

    const category = await this.prismaService.category.create({
      data: { ...createRequest, storeId },
    });
    return this.toCategoryResponse(category);
  }

  async findAll(
    storeId: number,
    request: FindAllCategoryRequest,
  ): Promise<WebResponse<CategoryResponse[]>> {
    const categoryRequest: FindAllCategoryRequest =
      this.validationService.validate(CategoryValidation.FIND_ALL, request);

    const filters: any = [
      {
        isDeleted: false,
      },
      {
        storeId: storeId,
      },
    ];

    if (categoryRequest.name) {
      filters.push({
        name: {
          contains: categoryRequest.name,
        },
      });
    }

    const skip = (categoryRequest.page - 1) * categoryRequest.size;

    const [categories, total] = await Promise.all([
      this.prismaService.category.findMany({
        where: {
          AND: filters,
        },
        take: categoryRequest.size,
        skip,
      }),
      this.prismaService.category.count({
        where: {
          AND: filters,
        },
      }),
    ]);

    return {
      data: categories.map((category) => this.toCategoryResponse(category)),
      paging: {
        currentPage: categoryRequest.page,
        size: categoryRequest.size,
        totalPage: Math.ceil(total / categoryRequest.size),
      },
    };
  }

  async checkCategoryMustExists(
    categoryId: number,
    storeId: number,
  ): Promise<Category> {
    const category = await this.prismaService.category.findFirst({
      where: {
        id: categoryId,
        storeId,
        isDeleted: false,
      },
    });

    if (!category) {
      throw new HttpException('Category not found', 404);
    }

    return category;
  }

  async update(
    id: number,
    storeId: number,
    request: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    const updateRequest: UpdateCategoryDto = this.validationService.validate(
      CategoryValidation.UPDATE,
      request,
    );
    let category = await this.checkCategoryMustExists(id, storeId);

    category = await this.prismaService.category.update({
      where: {
        id: category.id,
        storeId: category.storeId,
      },
      data: {
        name: updateRequest.name,
      },
    });
    return this.toCategoryResponse(category);
  }

  async remove(id: number, storeId: number): Promise<CategoryResponse> {
    let category = await this.checkCategoryMustExists(id, storeId);
    category = await this.prismaService.category.update({
      where: {
        id: category.id,
        storeId: category.storeId,
      },
      data: {
        isDeleted: true,
      },
    });
    return this.toCategoryResponse(category);
  }
}
