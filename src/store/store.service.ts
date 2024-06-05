import { HttpException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import { StoreResponse, FindAllStoreRequest } from '../model/store.model';
import { StoreValidation } from './store.validation';
import { WebResponse } from '../model/web.model';
import { User } from '../model/user.model';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoreService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async create(
    user: User,
    createStore: CreateStoreDto,
  ): Promise<StoreResponse> {
    const request = this.validationService.validate(StoreValidation.CREATE, {
      ...createStore,
      userId: user.id,
    });

    const store = await this.prismaService.store.create({
      data: {
        name: request.name,
        userId: request.userId,
        UserStores: {
          create: [
            {
              userId: request.userId,
              role: Role.OWNER,
            },
          ],
        },
      },
      include: {
        UserStores: true,
      },
    });

    return {
      id: store.id,
      name: store.name,
    };
  }

  async findAll(
    user: User,
    request: FindAllStoreRequest,
  ): Promise<WebResponse<StoreResponse[]>> {
    const findAllStoreRequest = this.validationService.validate(
      StoreValidation.FIND_ALL,
      {
        ...request,
        userId: user.id,
      },
    );

    const filters: any[] = [];

    filters.push({
      store: {
        isDeleted: false,
      },
    });

    if (findAllStoreRequest.name) {
      filters.push({
        store: {
          name: {
            contains: findAllStoreRequest.name,
          },
        },
      });
    }

    const skip = (findAllStoreRequest.page - 1) * findAllStoreRequest.size;

    const [stores, total] = await Promise.all([
      this.prismaService.userStores.findMany({
        where: {
          AND: filters,
        },
        select: {
          role: true,
          store: true,
        },
        skip,
        take: findAllStoreRequest.size,
      }),
      this.prismaService.userStores.count({
        where: {
          AND: filters,
        },
      }),
    ]);

    return {
      data: stores.map((store) => ({
        id: store.store.id,
        name: store.store.name,
        role: store.role,
      })),
      paging: {
        currentPage: findAllStoreRequest.page,
        size: findAllStoreRequest.size,
        totalPage: Math.ceil(total / findAllStoreRequest.size),
      },
    };
  }

  async findOne(storeId: number, user: User): Promise<StoreResponse> {
    const findOneStoreRequest = this.validationService.validate(
      StoreValidation.FIND_ONE,
      { id: storeId, userId: user.id },
    );

    return this.checkStoreMustExists(
      findOneStoreRequest.userId,
      findOneStoreRequest.id,
    );
  }

  async checkStoreMustExists(
    userId: number,
    storeId: number,
  ): Promise<StoreResponse> {
    const userStore = await this.prismaService.userStores.findFirst({
      where: {
        userId: userId,
        storeId: storeId,
        store: {
          isDeleted: false,
        },
      },
      select: {
        store: true,
      },
    });
    if (!userStore) {
      throw new HttpException('Store not found', 404);
    }
    return {
      id: userStore.store.id,
      name: userStore.store.name,
    };
  }

  async update(
    storeId: number,
    user: User,
    updateStoreDto: UpdateStoreDto,
  ): Promise<StoreResponse> {
    const request = this.validationService.validate(StoreValidation.UPDATE, {
      ...updateStoreDto,
      userId: user.id,
      id: storeId,
    });
    const store = await this.checkStoreMustExists(request.userId, request.id);

    const updateStore = await this.prismaService.store.update({
      where: {
        id: store.id,
      },
      data: {
        name: request.name,
      },
      include: {
        UserStores: {
          where: {
            userId: request.userId,
          },
        },
      },
    });
    return {
      id: updateStore.id,
      name: updateStore.name,
    };
  }

  async remove(storeId: number, user: User): Promise<StoreResponse> {
    const deleteRequest = this.validationService.validate(
      StoreValidation.REMOVE,
      {
        id: storeId,
        userId: user.id,
      },
    );
    const store = await this.checkStoreMustExists(
      deleteRequest.userId,
      deleteRequest.id,
    );
    await this.prismaService.$transaction([
      this.prismaService.store.update({
        where: {
          id: deleteRequest.id,
          userId: deleteRequest.userId,
        },
        data: {
          isDeleted: true,
        },
      }),
      this.prismaService.category.updateMany({
        where: {
          storeId: store.id,
        },
        data: {
          isDeleted: true,
        },
      }),
      this.prismaService.product.updateMany({
        where: {
          storeId: store.id,
        },
        data: {
          isDeleted: true,
        },
      }),
    ]);
    return store;
  }
}
