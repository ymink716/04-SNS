import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { Like } from './entity/like.entity';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Post])],
  controllers: [LikeController],
  providers: [LikeService, PostService]
})
export class LikeModule {}
