import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/post/entity/post.entity';
import { PostService } from 'src/post/post.service';
import { User } from 'src/user/entity/user.entity';
import { ErrorType } from 'src/common/type/error-type.enum';
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

    const result = await this.commentRepository.delete({ id: commentId });
    
    return result;
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

  /**
   * @description 댓글 작성자인지 확인
  */
  checkIsAuthor(comment: Comment, user: User): void {
    const isAuthor = comment.user.id === user.id;

    if (!isAuthor) {
      throw new HttpException(ErrorType.commentForbidden.message, ErrorType.commentForbidden.code);
    }
  }

  async getCommentsByPost(postId: number): Promise<Comment[]> {
    const comments: Comment[] = await this.commentRepository
    .createQueryBuilder('comment')
    .innerJoin('comment.post', 'post')
    .innerJoinAndSelect('commnet.user', 'user')
    .where('post.id = :postId', { postId })
    .getMany();

    return comments;
  }
}
