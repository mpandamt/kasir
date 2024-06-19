import { ValidationService } from './../common/validation.service';
import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthValidation } from './auth.validation';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService,
  ) {}

  async googleLogin(data: { email: string; name: string }) {
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

    if (user) {
      return user;
    }

    user = await this.prismaService.user.create({
      data: { ...data, password: '' },
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

  async register(registerDto: RegisterDto) {
    const register = await this.validationService.validate(
      AuthValidation.REGISTER,
      registerDto,
    );

    const totalUserWithSameEmailOrUsername =
      await this.prismaService.user.count({
        where: {
          email: register.email,
        },
      });
    if (totalUserWithSameEmailOrUsername != 0) {
      throw new HttpException('username or email already exists', 400);
    }

    register.password = await bcrypt.hash(register.password, 10);

    const user = await this.prismaService.user.create({
      data: register,
    });
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...restUser } = user;
      return restUser;
    }
    throw new HttpException('Failed to create user', 500);
  }
}
