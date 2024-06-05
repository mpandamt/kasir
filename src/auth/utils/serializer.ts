/* eslint-disable @typescript-eslint/ban-types */
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PrismaService } from '../common/prisma.service';

class UserPayload {
  id: number;
  selectedStore: number;
}

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  serializeUser(user: UserPayload, done: Function) {
    console.log('Serializer User');
    done(null, user);
  }

  async deserializeUser(payload: UserPayload, done: Function) {
    console.log('Deserialize User');
    const user = await this.prismaService.user.findUnique({
      where: {
        id: payload.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
    return user ? done(null, user) : done(null, null);
  }
}
