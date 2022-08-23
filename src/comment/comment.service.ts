import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entity/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly postService: PostService,
  ) {}

  async createComment(createCommentDto: CreateCommentDto, user: User): Promise<Comment> {
    const { content, postId } = createCommentDto;

    const post: Post = await this.postService.getPostById(postId);
    const comment: Comment = this.commentRepository.create({ content, user, post });
    await this.commentRepository.save(comment);

    return comment;
  }

  async updateComment(commentId: number, updateCommentDto: UpdateCommentDto, user: User): Promise<Comment> {
    const { content } = updateCommentDto;
    const comment: Comment = await this.getCommentById(commentId);

    this.checkIsAuthor(comment, user);

    comment.content = content;
    const updatedComment: Comment = await this.commentRepository.save(comment);
    
    return updatedComment;
  }

  async deleteComment(commentId: number, user: User): Promise<void> {
    const comment = await this.getCommentById(commentId);
    this.checkIsAuthor(comment, user);

    await this.commentRepository.delete({ id: commentId });
  }

  async getCommentById(commentId: number): Promise<Comment> {
    const comment: Comment = await this.commentRepository.findOne({ 
      where: { id: commentId },
      relations: ['user'], 
    });

    if (!comment) {
      throw new HttpException(ErrorType.commentNotFound.message, ErrorType.commentNotFound.code);
    }

    return comment;
  }

  /** 
   * @description 댓글 작성자인지 확인
  */
  checkIsAuthor(comment: Comment, user: User): void {
    const isAuthor = comment.user.id === user.id;

    if (!isAuthor) {
      throw new HttpException(ErrorType.commentForbidden.message, ErrorType.commentForbidden.code);
    }
  }
}
