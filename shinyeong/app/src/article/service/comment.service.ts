import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from '../dto/createComment.dto';
import { DeletedCommentDto } from '../dto/deletedComment.dto';
import { UpdateCommentDto } from '../dto/updateComment.dto';
import { Article } from '../entities/article.entity';
import { Comment } from '../entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  /**
   * @description 게시글 댓글 생성
   */
  public async createComment(
    articleId: number,
    commentData: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    try {
      const article = await this.articleRepository.findOne({
        where: { id: articleId },
      });

      if (!article)
        throw new BadRequestException('존재하지 않는 게시물입니다.');

      const comment = await this.commentRepository.create({
        comment: commentData.comment,
        user,
        article,
      });

      return await this.commentRepository.save(comment);
    } catch (e) {
      if (e) throw e;
      else throw new InternalServerErrorException();
    }
  }

  /**
   * @description 게시글 댓글 수정
   */
  public async updateComment(
    commentId: number,
    commentData: UpdateCommentDto,
    user: User,
  ): Promise<UpdateCommentDto> {
    try {
      const comment = await this.commentRepository
        .createQueryBuilder()
        .update(Comment)
        .set(commentData)
        .where('id = :id', { id: commentId })
        .andWhere('userId = :userId', { userId: user.id })
        .execute();

      if (comment.affected === 0) {
        throw new BadRequestException(
          '존재하지 않는 댓글이거나 자신의 댓글이 아닙니다.',
        );
      }
      return commentData;
    } catch (e) {
      if (e) throw e;
      throw new InternalServerErrorException();
    }
  }

  /**
   * @description 게시글 댓글 삭제
   */

  public async softDeleteComment(
    commentId: number,
    user: User,
  ): Promise<DeletedCommentDto> {
    try {
      const comment = await this.commentRepository.softDelete({
        id: commentId,
        user,
      });
      if (comment.affected === 0) {
        throw new BadRequestException(
          '존재하지 않는 댓글이거나 자신의 댓글이 아닙니다.',
        );
      }

      const result = new DeletedCommentDto();
      result.deletedCommentId = commentId;
      return result;
    } catch (e) {
      if (e) throw e;
      throw new InternalServerErrorException();
    }
  }
}
