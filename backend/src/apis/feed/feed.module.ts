import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Feed } from './entities/feed.entity';
import { FeedLike } from './entities/feedLike.entity';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Feed, FeedLike, User])],
  controllers: [FeedController],
  providers: [FeedService, UserService],
})
export class FeedModule {}
