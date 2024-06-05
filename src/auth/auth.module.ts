import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './utils/google.strategy';
import { LocalStrategy } from './utils/local.strategy';
import { UsersModule } from '../users/users.module';
import { SessionSerializer } from './utils/serializer';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
