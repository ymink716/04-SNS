import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/utils/error-type.enum';
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

  async createComment(createCommentDto: CreateCommentDto, user: User) {
    const { content, postId } = createCommentDto;

    const post: Post = await this.postService.getPostById(postId);
    
    try {
      const comment: Comment = this.commentRepository.create({ content, user, post });
      const newComment: Comment = await this.commentRepository.save(comment);

      return newComment;
    } catch (error) {
      console.error(error);
      throw new HttpException(ErrorType.databaseServerError.message, ErrorType.databaseServerError.code);
    }
  }

  async updateComment(commentId: number, updateCommentDto: UpdateCommentDto, user: User) {
    const { content } = updateCommentDto;
    const comment: Comment = await this.getCommentById(commentId);

    this.checkIsAuthor(comment, user);

    comment.content = content;
    const updatedComment: Comment = await this.commentRepository.save(comment);
    
    return updatedComment;
  }

  async deleteComment(commentId: number, user: User) {
    const comment = await this.getCommentById(commentId);
    this.checkIsAuthor(comment, user);

    const result = await this.commentRepository.softDelete({ id: commentId });
    
    return result;
  }

  async restoreComment(commentId: number, user: User) {
    const comment: Comment = await this.commentRepository
      .createQueryBuilder('comment')
      .withDeleted()
      .innerJoinAndSelect('comment.user', 'user')
      .where('user.id = :userId', { userId: user.id })
      .andWhere('comment.id = :commentId', { commentId })
      .getOne();
    
    if (!comment) {
      throw new HttpException(ErrorType.commnetNotFound.message, ErrorType.commnetNotFound.code);
    }

    if (comment.deletedAt === null) {
      throw new HttpException(ErrorType.commentNotDeleted.message, ErrorType.commentNotDeleted.code);
    }

    try {
      comment.deletedAt = null;
      await this.commentRepository.save(comment);
    } catch (error) {
      console.error(error);
      throw new HttpException(ErrorType.serverError.message, ErrorType.serverError.code);
    }
  }

  async getCommentById(commentId: number): Promise<Comment> {
    const comment: Comment = await this.commentRepository.findOne({ 
      where: { id: commentId },
      relations: ['user'], 
    });

    if (!comment) {
      throw new HttpException(ErrorType.commnetNotFound.message, ErrorType.commnetNotFound.code);
    }

    return comment;
  }

  checkIsAuthor(comment: Comment, user: User): void {
    const isAuthor = comment.user.id === user.id;

    if (!isAuthor) {
      throw new HttpException(ErrorType.commentForbidden.message, ErrorType.commentForbidden.code);
    }
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    const comments: Comment[] = await this.commentRepository
    .createQueryBuilder('comment')
    .withDeleted()
    .innerJoinAndSelect('comment.post', 'post')
    .where('post.id = :postId', { postId })
    .getMany();

    return comments;
  }
}
