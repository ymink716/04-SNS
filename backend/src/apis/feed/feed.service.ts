import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FetchFeedQuery } from 'src/apis/feed/handler/fetchFeed.query';
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

  async create({ user, createFeedInput }): Promise<Feed> {
    const userInfo: User = await this.userService.fetch({ email: user.email });

    if (!userInfo) throw new NotFoundException('유저 정보가 존재하지 않습니다');
    const result = await this.feedRepository.save({
      user: userInfo,
      ...createFeedInput,
    });
    delete result.user.password;
    return result;
  }

  async update({ feedId, user, updateFeedInput }) {
    const userInfo: User = await this.userService.fetch({ email: user.email });

    if (!userInfo) throw new NotFoundException('유저 정보가 존재하지 않습니다');

    const feed = await this.feedRepository.findOne({ where: { id: feedId } });

    if (!feed) throw new NotFoundException('존재하지 않는 게시글입니다');

    const result = await this.feedRepository.save({
      ...feed,
      user: userInfo,
      ...updateFeedInput,
    });
    delete result.user.password;
    return result;
  }
  async delete({ feedId }) {
    const feed = await this.feedRepository.findOne({ where: { id: feedId } });

    if (!feed) throw new NotFoundException('존재하지 않는 게시글입니다');
    const result = await this.feedRepository.softDelete({ id: feedId });

    return result.affected ? true : false;
  }

  async restore({ feedId }) {
    const feed = await this.feedRepository.findOne({
      where: { id: feedId },
      withDeleted: true,
    });
    if (!feed) throw new NotFoundException('존재하지 않는 게시글입니다');

    const result = await this.feedRepository.restore({ id: feedId });
    return result.affected ? true : false;
  }

  async like({ user, feedId }) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction('READ COMMITTED');
    try {
      const feedLike = await queryRunner.manager.findOne(
        FeedLike, //
        { where: { feed: feedId } },
      );

      const userInfo = await this.userRepository.findOne({
        where: { email: user.email },
      });

      const feed = await queryRunner.manager.findOne(Feed, {
        where: { id: feedId },
      });

      if (!feed || !userInfo) throw new NotFoundException();

      if (!feedLike) {
        const updateLike = this.feedLikeRepository.create({
          user,
          feed,
          isLike: true,
        });
        await queryRunner.manager.save(updateLike);

        const updateFeed = this.feedRepository.create({
          ...feed,
          likeCount: feed.likeCount + 1,
        });
        await queryRunner.manager.save(updateFeed);
        await queryRunner.commitTransaction();

        return true;
      } else {
        if (feedLike.isLike) {
          const updateLike = this.feedLikeRepository.create({
            ...feedLike,
            user,
            feed,
            isLike: false,
          });
          await queryRunner.manager.save(updateLike);

          const updateFeed = this.feedRepository.create({
            ...feed,
            likeCount: feed.likeCount - 1,
          });
          await queryRunner.manager.save(updateFeed);
          await queryRunner.commitTransaction();

          return false;
        } else {
          const updateLike = this.feedLikeRepository.create({
            ...feedLike,
            user,
            feed,
            isLike: true,
          });
          await queryRunner.manager.save(updateLike);

          const updateFeed = this.feedRepository.create({
            ...feed,
            likeCount: feed.likeCount + 1,
          });
          await queryRunner.manager.save(updateFeed);
          await queryRunner.commitTransaction();

          return true;
        }
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findOne({ feedId }): Promise<Feed> {
    const result = await this.feedRepository.findOne({ where: { id: feedId } });
    const fetchFeedQuery = new FetchFeedQuery(result);
    this.queryBus.execute(fetchFeedQuery);
    delete result.user.password;
    return result;
  }

  async findList({ ...fetchFeedOptions }: FetchFeedOptions) {
    let { order, orderBy, page, pageCount } = fetchFeedOptions;
    const { filter, search } = fetchFeedOptions;
    const qb = this.feedRepository.createQueryBuilder('feed');
    let hashTags;

    if (filter) {
      hashTags = filter.split(',');
      qb.andWhere(
        new Brackets((qb) => {
          hashTags.forEach((el) => {
            qb.andWhere(`feed.hashTags like '%${el}%'`);
          });
        }),
      );
    }

    if (search) {
      qb.andWhere('feed.content like :content', {
        content: `%${search}%`,
      }).orWhere('feed.title like :title', { title: `%${search}%` });
    }

    if (order && orderBy) {
      qb.orderBy(`feed.${order}`, orderBy);
    } else {
      order = OrderOption.CREATEDAT;
      orderBy = OrderByOption.ASC;
      qb.orderBy(`feed.${order}`, orderBy); // default
    }

    if (page && pageCount) {
      qb.take(pageCount).skip((page - 1) * pageCount);
    } else {
      page = 1;
      pageCount = 10;
      qb.take(pageCount).skip((page - 1) * pageCount);
    }

    const result = await qb.getManyAndCount();
    const [feeds, total] = result;
    const output: FetchFeedsOutput = {
      feeds,
      page,
      pageCount,
      total,
      search,
      filter: hashTags,
    };
    return output;
  }
}
