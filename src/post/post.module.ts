import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entity/comment.entity';
import { Like } from 'src/like/entity/like.entity';
import { LikeService } from 'src/like/like.service';
import { Hashtag } from './entity/hashtag.entity';
import { PostHashtag } from './entity/post-hashtag.entity';
import { Post } from './entity/post.entity';
import { HashtagService } from './hashtag.service';
import { PostHashtagService } from './post-hashtag.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([ Post, Hashtag, PostHashtag, Like, Comment ])],
  controllers: [PostController],
  providers: [PostService, HashtagService, PostHashtagService, LikeService, CommentService],
  exports: [PostService]
})
export class PostModule {}
