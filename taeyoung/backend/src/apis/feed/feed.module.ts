import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Feed } from './entities/feed.entity';
import { FeedLike } from './entities/feedLike.entity';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';
import { FetchFeedQueryHandler } from './handler/fetchFeed.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Feed, FeedLike, User]), CqrsModule],
  controllers: [FeedController],
  providers: [FeedService, UserService, FetchFeedQueryHandler],
})
export class FeedModule {}
