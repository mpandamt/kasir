import { Module } from '@nestjs/common';
import { UserStoreService } from './user-store.service';
import { UserStoreController } from './user-store.controller';

@Module({
  providers: [UserStoreService],
  exports: [UserStoreService],
  controllers: [UserStoreController],
})
export class UserStoreModule {}
