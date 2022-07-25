import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entity/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post])],
  controllers: [CommentController],
  providers: [CommentService, PostService],
  exports: [CommentService]
})
export class CommentModule {}
