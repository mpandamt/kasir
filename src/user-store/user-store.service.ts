import { HttpException, Injectable } from '@nestjs/common';
import { Role, User, UserStores } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { ValidationService } from '../common/validation.service';
import {
  FindAllUserStoreRequest,
  UserStoreResponse,
} from '../model/user-store.model';
import { WebResponse } from '../model/web.model';
import { UserStoreValidation } from './user-store.validation';
import { CreateUserStoreDto } from './dto/create-user-store.dto';
import { UpdateUserStoreDto } from './dto/update-user-store.dto';

@Injectable()
export class UserStoreService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly validationService: ValidationService,
  ) {}

  async getCurrentUserRole(userId: number, storeId: number): Promise<Role> {
    const userStore = await this.prismaService.userStores.findFirst({
      where: {
        userId,
        storeId,
      },
    });

    if (!userStore) {
      throw new HttpException('Forbidden Access', 403);
    }

    return userStore.role;
  }

  async create(
    user: User,
    storeId: number,
    createUserStoreDto: CreateUserStoreDto,
  ): Promise<UserStoreResponse> {
    const request: CreateUserStoreDto = this.validationService.validate(
      UserStoreValidation.CREATE,
      createUserStoreDto,
    );

    const currentUserRole = await this.getCurrentUserRole(user.id, storeId);
    if (currentUserRole == Role.CASHIER) {
      throw new HttpException('Forbidden Access', 403);
    }
    if (currentUserRole == Role.ADMIN && request.role == Role.OWNER) {
      throw new HttpException('Forbidden Access', 403);
    }
    if (currentUserRole == Role.OWNER && request.role == Role.OWNER) {
      throw new HttpException('Forbidden Access', 403);
    }

    const addUser = await this.prismaService.user.findFirst({
      where: {
        email: request.email,
      },
    });

    if (!addUser) {
      throw new HttpException('User not found', 404);
    }

    const isUserAlreadyAdded = await this.prismaService.userStores.count({
      where: {
        userId: addUser.id,
        storeId,
      },
    });
    if (isUserAlreadyAdded) {
      throw new HttpException('User already added', 404);
    }
    const userStore = await this.prismaService.userStores.create({
      data: {
        storeId,
        userId: addUser.id,
        role: request.role,
      },
    });
    return {
      id: userStore.id,
      email: addUser.email,
      name: addUser.name,
      role: userStore.role,
    };
  }

  async findAll(
    storeId: number,
    findAllStoreRequest: FindAllUserStoreRequest,
  ): Promise<WebResponse<UserStoreResponse[]>> {
    const request: FindAllUserStoreRequest = this.validationService.validate(
      UserStoreValidation.FIND_ALL,
      findAllStoreRequest,
    );

    const filters = [];

    filters.push({
      storeId,
    });
    if (request.name) {
      filters.push({
        user: {
          name: {
            contains: request.name,
          },
        },
      });
    }
    if (request.role) {
      filters.push({
        role: request.role,
      });
    }

    const skip = (request.page - 1) * request.size;

    const [userStores, total] = await Promise.all([
      this.prismaService.userStores.findMany({
        where: { AND: filters },
        include: {
          user: true,
        },
        skip,
        take: request.size,
      }),
      this.prismaService.userStores.count({
        where: {
          AND: filters,
        },
      }),
    ]);

    return {
      data: userStores.map((userStore) => ({
        id: userStore.id,
        name: userStore.user.name,
        email: userStore.user.email,
        role: userStore.role,
      })),
      paging: {
        currentPage: findAllStoreRequest.page,
        size: findAllStoreRequest.size,
        totalPage: Math.ceil(total / findAllStoreRequest.size),
      },
    };
  }

  async checkStoreMustExists(id: number, storeId: number): Promise<UserStores> {
    const userStore = await this.prismaService.userStores.findFirst({
      where: {
        id,
        storeId,
      },
    });
    if (!userStore) {
      throw new HttpException('User store not found', 404);
    }

    return userStore;
  }

  async update(
    id: number,
    user: User,
    storeId: number,
    updateUserStoreDto: UpdateUserStoreDto,
  ): Promise<UserStoreResponse> {
    const request = this.validationService.validate(
      UserStoreValidation.UPDATE,
      updateUserStoreDto,
    );
    const currentUserRole = await this.getCurrentUserRole(user.id, storeId);
    if (currentUserRole == Role.CASHIER) {
      throw new HttpException('Forbidden Access', 403);
    }
    if (currentUserRole == Role.ADMIN && request.role == Role.OWNER) {
      throw new HttpException('Forbidden Access', 403);
    }
    if (currentUserRole == Role.OWNER && request.role == Role.OWNER) {
      throw new HttpException('Forbidden Access', 403);
    }

    const userStore = await this.checkStoreMustExists(id, storeId);

    if (currentUserRole == Role.OWNER && userStore.userId == user.id) {
      throw new HttpException(`Can't change ownership`, 403);
    }

    const updateUserStore = await this.prismaService.userStores.update({
      where: {
        id,
      },
      data: {
        role: request.role,
      },
      include: {
        user: true,
      },
    });
    return {
      id: updateUserStore.id,
      name: updateUserStore.user.name,
      email: updateUserStore.user.email,
      role: updateUserStore.role,
    };
  }

  async remove(
    id: number,
    user: User,
    storeId: number,
  ): Promise<UserStoreResponse> {
    const currentUserRole = await this.getCurrentUserRole(user.id, storeId);
    if (currentUserRole == Role.CASHIER) {
      throw new HttpException('Forbidden Access', 403);
    }

    const userStore = await this.checkStoreMustExists(id, storeId);

    if (currentUserRole == Role.OWNER && userStore.userId == user.id) {
      throw new HttpException(`Can't leave your user store`, 403);
    }

    const deleteUserStore = await this.prismaService.userStores.delete({
      where: {
        id,
      },
      include: {
        user: true,
      },
    });
    return {
      id: deleteUserStore.id,
      name: deleteUserStore.user.name,
      email: deleteUserStore.user.email,
      role: deleteUserStore.role,
    };
  }

  async getRole(userId: number, storeId: number): Promise<Role | null> {
    const result = await this.prismaService.userStores.findFirst({
      where: {
        userId,
        storeId,
        store: {
          isDeleted: false,
        },
      },
      select: {
        role: true,
      },
    });
    return result?.role || null;
  }
}
