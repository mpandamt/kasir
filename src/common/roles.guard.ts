import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator';
import { UserStoreService } from '../user-store/user-store.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly userStoreService: UserStoreService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const roles = this.reflector.get(Roles, context.getHandler());
    const user = request.user;

    if (!roles) {
      return true;
    }
    if (!user) {
      throw new UnauthorizedException();
    }

    const storeId = Number(request.params.storeId);
    if (!storeId) {
      return true;
    }

    const userRole = await this.userStoreService.getRole(user.id, storeId);

    if (!roles.includes(userRole)) {
      throw new ForbiddenException();
    }
    return true;
  }
}
