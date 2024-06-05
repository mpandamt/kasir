import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { ValidationService } from './validation.service';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { UserStoreModule } from '../user-store/user-store.module';
import { RolesGuard } from './roles.guard';
import { RedisModule } from '@nestjs-modules/ioredis';

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserStoreModule,
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL, // replace with your Redis URL
    }),
  ],
  providers: [
    PrismaService,
    ValidationService,
    {
      provide: APP_FILTER,
      useClass: ErrorFilter,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [PrismaService, ValidationService],
})
export class CommonModule {}
