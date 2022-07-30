import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchFeedQuery } from 'src/apis/feed/handler/fetchFeed.query';
import { ErrorType } from 'src/common/type/error.type';
import { Brackets, DataSource, Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import {
  FetchFeedOptions,
  OrderOption,
  SortOption,
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
    private readonly dataSource: DataSource,
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

    const feed: Feed = await this.feedRepository.findOne({
      where: { id: feedId },
    });

    if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);
    if (feed.user.email !== user.email) {
      throw new ForbiddenException(ErrorType.feed.notYours.msg);
    }
    const result = await this.feedRepository.save({
      ...feed,
      user,
      ...updateFeedInput,
    });

    delete result.user.password;
    return result;
  }

  async delete({ currentUser, feedId }): Promise<boolean> {
    const feed = await this.feedRepository.findOne({ where: { id: feedId } });

    if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);

    if (feed.user.email !== currentUser.email)
      throw new ForbiddenException(ErrorType.feed.notYours.msg);

    const result = await this.feedRepository.softDelete({ id: feedId });

    return result.affected ? true : false;
  }

  async restore({ currentUser, feedId }): Promise<boolean> {
    const feed = await this.feedRepository.findOne({
      where: { id: feedId },
      withDeleted: true,
    });

    if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);
    if (feed.user.email !== currentUser.email)
      throw new ForbiddenException(ErrorType.feed.notYours.msg);

    const result = await this.feedRepository.restore({ id: feedId });

    return result.affected ? true : false;
  }

  async like({ currentUser, feedId }): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
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

      if (!feedLike?.isLike || !feedLike) {
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
      } else if (feedLike?.isLike) {
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
      .where('feed.id = :id', { id: feedId })
      .leftJoin('feed.user', 'user')
      .addSelect('user.email')
      .getOne();

    if (!feed) throw new NotFoundException(ErrorType.feed.notFound.msg);

    const fetchFeedQuery = new FetchFeedQuery(feed);
    this.queryBus.execute(fetchFeedQuery);
    // 기존 로직과 별개로 쿼리버스를 통해 조회수가 증가합니다

    delete feed.user.password;
    return feed;
  }

  async findList({
    ...fetchFeedOptions
  }: FetchFeedOptions): Promise<FetchFeedsOutput> {
    let { sort, order, page, pageCount } = fetchFeedOptions;
    const { filter, search } = fetchFeedOptions;
    const qb = this.feedRepository
      .createQueryBuilder('feed')
      .leftJoin('feed.user', 'user')
      .addSelect('user.email');

    // default 값 설정
    sort = sort || SortOption.CREATEDAT;
    order = order || OrderOption.DESC;
    page = page || 1;
    pageCount = pageCount || 10;

    let hashTags;

    if (filter) {
      hashTags = filter.split(',').map((el) => {
        return '#' + el;
      });
      // 문자열로 들어온 검색어를 [ '#해시태그1', '#해시태그2' ]와 같이 배열형태로 변경한 후 andWhere like 문을 검색어 개수만큼 실행합니다
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
          qb.orWhere(`feed.title like '%${search}%'`);
          qb.orWhere(`feed.content like '%${search}%'`);
        }),
      );
    }

    const result = await qb
      .orderBy(`feed.${sort}`, order)
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
      sort,
      order,
      filter: hashTags || null,
    };
    return output;
  }
}
