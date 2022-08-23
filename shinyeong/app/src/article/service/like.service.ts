import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { Article } from '../entities/article.entity';
import { Like } from '../entities/like.entity';

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like)
    private likeRepository: Repository<Like>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  /**
   * @description 게시글 좋아요 요청
   */
  public async likeArticle(articleId: number, user: User): Promise<object> {
    const isExist = await this.likeRepository
      .createQueryBuilder()
      .where('userId = :userId', { userId: user.id })
      .andWhere('articleId = :articleId', { articleId })
      .getOne();

    if (isExist) {
      throw new ConflictException('이미 좋아요를 눌렀습니다.');
    }

    try {
      const like = await this.likeRepository.create({
        userId: user.id,
        articleId,
      });

      const article = await this.articleRepository.findOne({
        where: { id: articleId },
      });
      article.totalLike++;

      await this.likeRepository.insert(like);
      const updateTotalLike = await this.articleRepository.save(article);

      return { totalLike: updateTotalLike.totalLike };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @description 좋아요 취소
   */
  public async unLikeArticle(articleId: number, user: User): Promise<object> {
    try {
      await this.likeRepository
        .createQueryBuilder()
        .delete()
        .from(Like)
        .where('articleId = :articleId', { articleId })
        .andWhere('userId = :userId', { userId: user.id })
        .execute();

      const article = await this.articleRepository.findOne({
        where: { id: articleId },
      });
      article.totalLike--;

      const result = await this.articleRepository.save(article);
      return { totalLike: result.totalLike };
    } catch (e) {
      throw new NotFoundException();
    }
  }

  /**
   * @description 좋아요 누른 사람 목록 요청
   */
  public async getUsersPushLike(articleId: number) {
    try {
      const result = await this.articleRepository
        .createQueryBuilder('a')
        .select(['a.id', 'a.totalLike'])
        .where('a.id = :id', { id: articleId })
        .leftJoin('a.like', 'lk')
        .leftJoin('lk.user', 'u')
        .addSelect(['lk.userId'])
        .addSelect(['u.nickname'])
        .getOne();

      return result;
    } catch (e) {
      throw new BadRequestException();
    }
  }
}
