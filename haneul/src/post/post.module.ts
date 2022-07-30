import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Like } from 'typeorm';
import { Hashtags } from './entity/hashTag.entity';
import { Post } from './entity/post.entity';
import { LikeService } from './like.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Hashtags, User])],
  controllers: [PostController],
  providers: [PostService,LikeService]
})
export class PostModule {}
