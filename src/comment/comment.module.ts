import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { PostModule } from 'src/post/post.module';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entity/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post]), PostModule],
  controllers: [CommentController],
  providers: [CommentService],
  exports: [CommentService]
})
export class CommentModule {}
