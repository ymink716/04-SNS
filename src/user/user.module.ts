import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './entity/follow.entity';
import { User } from './entity/user.entity';
import { FollowService } from './follow.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports:[TypeOrmModule.forFeature([User, Follow])],
  controllers: [UserController],
  providers: [UserService, FollowService],
  exports: [UserService],
})
export class UserModule {}
