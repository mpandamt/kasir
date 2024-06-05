import { ValidationService } from './../common/validation.service';
import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterUserRequest } from '../model/user.model';
import { AuthValidation } from './auth.validation';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async googleLogin(data: RegisterUserRequest) {
    let user = await this.prismaService.user.findUnique({
      where: {
        email: data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    console.log({ user });

    if (user) {
      return user;
    }

    user = await this.prismaService.user.create({
      data: data,
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    return user || null;
  }

  async validateUserLocal(email: string, pass: string): Promise<any> {
    const request = this.validationService.validate(AuthValidation.LOGIN, {
      email,
      password: pass,
    });
    const user = await this.prismaService.user.findUnique({
      where: {
        email: request.email,
      },
    });
    console.log({ user });
    if (!user) {
      return null;
    }
    const isPasswordMatches = await bcrypt.compare(
      request.password,
      user.password,
    );
    if (!isPasswordMatches) {
      return null;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async register(request: RegisterUserRequest) {
    const registerRequest = await this.validationService.validate(
      AuthValidation.REGISTER,
      request,
    );
    console.log({ registerRequest });

    const totalUserWithSameEmailOrUsername =
      await this.prismaService.user.count({
        where: {
          email: registerRequest.email,
        },
      });
    if (totalUserWithSameEmailOrUsername != 0) {
      throw new HttpException('username or email already exists', 400);
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await this.prismaService.user.create({
      data: registerRequest,
    });
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...restUser } = user;
      return restUser;
    }
    return null;
  }

  async logout(sessionId: string): Promise<boolean> {
    const result = await this.redis.del(`sess:${sessionId}`);
    return result === 1;
  }
}
