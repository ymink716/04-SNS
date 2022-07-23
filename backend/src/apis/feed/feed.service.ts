import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchFeedQuery } from 'src/apis/feed/handler/fetchFeed.query';
import { ErrorType } from 'src/common/type/error.type';
import { Brackets, Connection, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import {
  FetchFeedOptions,
  OrderByOption,
  OrderOption,
} from './dto/fetchFeed.options';
import { FetchFeedsOutput } from './dto/fetchFeed.output';
import { Feed } from './entities/feed.entity';
import { FeedLike } from './entities/feedLike.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Feed)
    private readonly feedRepository: Repository<Feed>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(FeedLike)
    private readonly feedLikeRepository: Repository<FeedLike>,
    private readonly userService: UserService,
    private readonly connection: Connection,
    private readonly queryBus: QueryBus,
  ) {}

  async create({ currentUser, createFeedInput }): Promise<Feed> {
    const user: User = await this.userService.fetch({
      email: currentUser.email,
    });

    const result = await this.feedRepository.save({
      user,
      ...createFeedInput,
    });

    delete result.user.password;
    return result;
  }

  async update({ feedId, currentUser, updateFeedInput }): Promise<Feed> {
    const user: User = await this.userService.fetch({
      email: currentUser.email,
    });

    const feed = await this.feedRepository.findOne({ where: { id: feedId } });

    if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);

    const result = await this.feedRepository.save({
      ...feed,
      user,
      ...updateFeedInput,
    });

    delete result.user.password;
    return result;
  }

  async delete({ feedId }): Promise<boolean> {
    const feed = await this.feedRepository.findOne({ where: { id: feedId } });

    if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);

    const result = await this.feedRepository.softDelete({ id: feedId });

    return result.affected ? true : false;
  }

  async restore({ feedId }): Promise<boolean> {
    const feed = await this.feedRepository.findOne({
      where: { id: feedId },
      withDeleted: true,
    });

    if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);

    const result = await this.feedRepository.restore({ id: feedId });

    return result.affected ? true : false;
  }

  async like({ currentUser, feedId }): Promise<boolean> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      const user = await this.userRepository.findOne({
        where: { email: currentUser.email },
      });

      const feed = await queryRunner.manager.findOne(Feed, {
        where: { id: feedId },
      });

      if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);

      const feedLike = await this.feedLikeRepository
        .createQueryBuilder('feedLike')
        .leftJoin('feedLike.user', 'user')
        .leftJoin('feedLike.feed', 'feed')
        .where({ user })
        .andWhere({ feed })
        .getOne();

      let updateLike: FeedLike;
      let updateFeed: Feed;
      let likeStatus: boolean = null;

      if (!feedLike.isLike || !feedLike) {
        // case 1.좋아요를 누르지 않은 상태
        // case 2.좋아요 관계가 형성되어있지 않은 상태
        // 좋아요 상태를 true로 변경하고 피드의 좋아요 수를 증가시킵니다
        updateLike = this.feedLikeRepository.create({
          ...feedLike,
          user,
          feed,
          isLike: true,
        });

        updateFeed = this.feedRepository.create({
          ...feed,
          likeCount: feed.likeCount + 1,
        });

        likeStatus = true;
      } else if (feedLike.isLike) {
        // case 3. 이미 좋아요를 누른 상태
        // 좋아요 취소로 간주합니다
        // 좋아요 상태를 false로 변경하고 피드의 좋아요 수를 감소시킵니다
        updateLike = this.feedLikeRepository.create({
          ...feedLike,
          user,
          feed,
          isLike: false,
        });

        updateFeed = this.feedRepository.create({
          ...feed,
          likeCount: feed.likeCount - 1,
        });

        likeStatus = false;
      }
      if (likeStatus === null)
        throw new NotAcceptableException(ErrorType.feed.failLike.msg);

      await queryRunner.manager.save(updateLike);
      await queryRunner.manager.save(updateFeed);
      await queryRunner.commitTransaction();

      return likeStatus;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne({ feedId }): Promise<Feed> {
    const feed = await this.feedRepository
      .createQueryBuilder('feed')
      .where('feed.id', { feedId })
      .leftJoin('feed.user', 'user')
      .addSelect('user.email')
      .getOne();

    if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);

    const fetchFeedQuery = new FetchFeedQuery(feed);
    this.queryBus.execute(fetchFeedQuery);

    delete feed.user.password;
    return feed;
  }

  async findList({
    ...fetchFeedOptions
  }: FetchFeedOptions): Promise<FetchFeedsOutput> {
    let { order, orderBy, page, pageCount } = fetchFeedOptions;
    const { filter, search } = fetchFeedOptions;
    const qb = this.feedRepository
      .createQueryBuilder('feed')
      .leftJoin('feed.user', 'user')
      .addSelect('user.email');

    // default 값 설정
    order = order || OrderOption.CREATEDAT;
    orderBy = orderBy || OrderByOption.DESC;
    page = page || 1;
    pageCount = pageCount || 10;

    let hashTags;

    if (filter) {
      hashTags = filter.split(',').map((el) => {
        return '#' + el;
      });
      qb.andWhere(
        new Brackets((qb) => {
          hashTags.forEach((el) => {
            qb.andWhere(`feed.hashTags like '%${el}%'`);
          });
        }),
      );
    }

    if (search) {
      qb.andWhere(
        new Brackets((qb) => {
          qb.orWhere('feed.title like :title', {
            title: `%${search}%`,
          }).orWhere('feed.content like :content', { content: `%${search}%` });
        }),
      );
    }

    const result = await qb
      .orderBy(`feed.${order}`, orderBy)
      .take(pageCount)
      .skip((page - 1) * pageCount)
      .getManyAndCount();

    const [feeds, total] = result;
    const output: FetchFeedsOutput = {
      feeds,
      page,
      pageCount,
      total,
      search,
      order,
      orderBy,
      filter: hashTags || null,
    };
    return output;
  }
}
