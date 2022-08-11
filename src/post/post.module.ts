import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entity/comment.entity';
import { Hashtag } from './entity/hashtag.entity';
import { PostHashtag } from './entity/post-hashtag.entity';
import { PostViewLog } from './entity/post-view-log.entity';
import { Post } from './entity/post.entity';
import { HashtagService } from './hashtag.service';
import { PostHashtagService } from './post-hashtag.service';
import { PostViewLogService } from './post-view-log.service';
import { PostController } from './post.controller';
import { PostService } from './post.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    Post, 
    Hashtag, 
    PostHashtag, 
    PostViewLog, 
  ])],
  controllers: [PostController],
  providers: [
    PostService, 
    HashtagService, 
    PostHashtagService, 
    PostViewLogService,
  ],
  exports: [PostService, HashtagService, PostHashtagService]
})
export class PostModule {}
