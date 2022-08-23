import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Brackets, Repository } from 'typeorm';
import { CreateArticleDTO } from '../dto/createArticle.dto';
import {
  getArticleListOption,
  orderByOption,
  orderOption,
} from '../dto/getArticleList.dto';
import { UpdateArticleDTO } from '../dto/updateArticle.dto';
import { Article } from '../entities/article.entity';
import { ArticleHashtag } from '../entities/article_hashtag.entity';
import { Hashtag } from '../entities/hashtag.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Hashtag)
    private hashtagRepository: Repository<Hashtag>,
    @InjectRepository(ArticleHashtag)
    private articleHashtagRepository: Repository<ArticleHashtag>,
  ) {
    this.articleRepository = articleRepository;
    this.hashtagRepository = hashtagRepository;
    this.articleHashtagRepository = articleHashtagRepository;
  }

  /**
   * @description 게시글 상세 요청
   */
  public async getArticle(articleId: number): Promise<object> {
    try {
      const article = await this.articleRepository
        .createQueryBuilder('a')
        .select([
          'a.id',
          'a.title',
          'a.content',
          'a.hashtag',
          'a.totalLike',
          'a.totalView',
          'a.createdAt',
        ])
        .addSelect(['u.id', 'u.nickname'])
        .leftJoin('a.user', 'u')
        .leftJoin('a.comment', 'cm')
        .addSelect(['cm.id', 'cm.comment', 'cm.createdAt'])
        .leftJoin('cm.user', 'cu')
        .addSelect(['cu.id', 'cu.nickname'])
        .where('a.id = :id', { id: articleId })
        .getOne();

      article.totalView++;
      await this.articleRepository.save(article);

      if (article.hashtag) {
        const hashtagList = await this.getHashtag(article.hashtag);
        return { ...article, hashtag: hashtagList };
      }
      return article;
    } catch (e) {
      throw new NotFoundException();
    }
  }
  /**
   * @description 게시글 목록 요청
   */
  public async getArticleList({ ...articleListOption }: getArticleListOption) {
    try {
      let { limit, offset, order, orderBy } = articleListOption;
      const { search, filter } = articleListOption;
      const qb = await this.articleRepository
        .createQueryBuilder('a')
        .select([
          'a.id',
          'a.title',
          'a.hashtag',
          'a.totalLike',
          'a.totalView',
          'a.createdAt',
        ]);

      if (search) {
        qb.andWhere('a.title like :title', {
          title: `%${search}%`,
        }).orWhere('a.content like :content', { content: `%${search}%` });
      }

      if (filter) {
        const tagList = filter.split(',');
        qb.leftJoin('a.articleHashtag', 'ha')
          .leftJoin('ha.hashtag', 'h')
          .andWhere('h.hashtag IN (:...hashtag)', { hashtag: tagList });

        // ! 수정
        // .andWhere(
        //   new Brackets((qb) => {
        //     tagList.forEach((tag) => {
        //       qb = qb.andWhere(`h.hashtag = '${tag}'`);
        //     });
        //   }),
        // );
      }

      limit = limit || 10;
      offset = offset || 0;
      order = order || orderOption.DESC;
      orderBy = orderByOption[orderBy] || orderByOption.CREATEDAT;

      const articleList = qb
        .orderBy(`a.${orderBy}`, order)
        .addSelect(['u.id', 'u.nickname'])
        .leftJoin('a.user', 'u')
        .skip(offset * limit)
        .take(limit)
        .getMany();

      return articleList;
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @description 게시글 생성 요청
   */
  public async createArticle(
    articleData: CreateArticleDTO,
    user: User,
  ): Promise<any> {
    try {
      const { content, title, hashtag } = articleData;
      const article = await this.articleRepository.create({
        user: user,
        content,
        title,
        hashtag,
      });
      const newArticle = await this.articleRepository.save(article);
      const hashtagList = await this.getHashtag(hashtag);

      for (const tag of hashtagList) {
        const hashtag = await this.findOrCreateHashtag(tag);
        await this.articleHashtagRepository.insert({
          hashtag,
          article: newArticle,
        });
      }
      return { ...newArticle, hashtag: hashtagList };
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @description 해시태그를 문자열에서 배열로 전환
   */
  public async getHashtag(hashtag: string) {
    const regexp = /[^#,]+/g;
    const tagList = [...hashtag.matchAll(regexp)];
    const hashtags = tagList.map((tag) => tag[0]);
    return hashtags;
  }

  /**
   * @description 해시태그 여부
   * 해시태그가 있는지 살펴보고, 없으면 해시태그를 새로 생성합니다.
   */
  public async findOrCreateHashtag(hashtag: string): Promise<object> {
    let hashtagData = await this.hashtagRepository.findOne({
      where: { hashtag: hashtag },
    });

    if (!hashtagData) {
      hashtagData = await this.hashtagRepository.save({
        hashtag,
      });
    }

    return hashtagData;
  }

  /**
   * @description 게시글 삭제 요청(soft delete)
   */
  public async deleteArticle(articleId: number, user: User): Promise<object> {
    const result = await this.articleRepository.softDelete({
      id: articleId,
      user: user,
    });

    if (!result.affected) {
      throw new UnauthorizedException();
    }
    return { id: articleId };
  }

  /**
   * @description 게시글 복구 요청
   */
  public async restoreArticle(articleId: number, user: User) {
    const deletedArticle = await this.articleRepository
      .createQueryBuilder()
      .withDeleted()
      .where('userId = :userId', { userId: user.id })
      .andWhere('id = :id', { id: articleId })
      .getOne();

    if (!deletedArticle) {
      throw new UnauthorizedException('게시물 작성자가 아닙니다.');
    }

    try {
      deletedArticle.deletedAt = null;
      return await this.articleRepository.save(deletedArticle);
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }

  /**
   * @description 게시글 수정 요청
   */
  public async updateArticle(
    articleId: number,
    updateArticleData: UpdateArticleDTO,
    user: User,
  ) {
    const result = await this.articleRepository
      .createQueryBuilder()
      .update(Article)
      .set(updateArticleData)
      .where('id = :id', { id: articleId })
      .andWhere('userId = :userId', { userId: user.id })
      .execute();

    if (updateArticleData.hashtag) {
      await this.updateHashtag(updateArticleData.hashtag, articleId);
    }
    if (result.affected === 0) {
      throw new UnauthorizedException();
    }
    return result;
  }

  public async updateHashtag(hashtag: string, articleId: number) {
    try {
      await this.articleHashtagRepository
        .createQueryBuilder()
        .delete()
        .from(ArticleHashtag)
        .where('articleId = :articleId', { articleId })
        .execute();

      const hashtagList = await this.getHashtag(hashtag);
      for (const tag of hashtagList) {
        const createHashtag = await this.findOrCreateHashtag(tag);

        await this.articleHashtagRepository.insert({
          hashtag: createHashtag,
          articleId: articleId,
        });
      }
    } catch (e) {
      throw new InternalServerErrorException();
    }
  }
}
