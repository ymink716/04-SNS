import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hashtag } from './entity/hashtag.entity';
import { PostHashtag } from './entity/post-hashtag.entity';
import { Post } from './entity/post.entity';
import { HashtagService } from './hashtag.service';
import { PostHashtagService } from './post-hashtag.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([ Post, Hashtag, PostHashtag ])],
  controllers: [PostController],
  providers: [PostService, HashtagService, PostHashtagService],
  exports: [PostService]
})
export class PostModule {}
