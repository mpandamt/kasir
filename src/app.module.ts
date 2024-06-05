import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { PassportModule } from '@nestjs/passport';
import { CategoryModule } from './category/category.module';
import { UserStoreModule } from './user-store/user-store.module';
import { ProductModule } from './product/product.module';
import { StoreModule } from './store/store.module';
import * as session from 'express-session';
import RedisStore from 'connect-redis';
import * as passport from 'passport';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { CartModule } from './cart/cart.module';
import { OrderModule } from './order/order.module';
import Redis from 'ioredis';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    AuthModule,
    UsersModule,
    CommonModule,
    PassportModule.register({ session: true }),
    CategoryModule,
    UserStoreModule,
    ProductModule,
    StoreModule,
    CartModule,
    OrderModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          store: new RedisStore({ client: this.redis }),
          resave: false,
          saveUninitialized: false,
          secret: process.env.SESSION_SECRET ?? '',
          cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24,
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
