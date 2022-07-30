import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Test } from '@nestjs/testing';
import { User } from 'src/apis/user/entities/user.entity';
import { UserService } from 'src/apis/user/user.service';
import { ICurrentUser } from 'src/common/auth/currentUser';
import { ErrorType } from 'src/common/type/error.type';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { CreateFeedInput } from '../dto/createFeed.input';
import { OrderOption, SortOption } from '../dto/fetchFeed.options';
import { FetchFeedsOutput } from '../dto/fetchFeed.output';
import { UpdateFeedInput } from '../dto/updateFeed.input';
import { Feed } from '../entities/feed.entity';
import { FeedLike } from '../entities/feedLike.entity';
import { FeedService } from '../feed.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  softDelete: jest.fn(),
  restore: jest.fn(),
  create: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockReturnThis(),
  }),
});

const mockUserService = () => ({
  fetch: jest.fn(),
});
describe('FeedService', () => {
  let feedService: FeedService;
  let userService: UserService;
  let feedRepository: MockRepository<Feed>;
  let userRepository: MockRepository<User>;
  let feedLikeRepository: MockRepository<FeedLike>;
  let dataSource: DataSource;

  const qr = {
    manager: {},
  } as QueryRunner;

  class MockDataSource {
    createQueryRunner(): QueryRunner {
      return qr;
    }
  }

  qr.connect = jest.fn();
  qr.startTransaction = jest.fn();
  qr.commitTransaction = jest.fn();
  qr.rollbackTransaction = jest.fn();
  qr.release = jest.fn();

  const bus = {
    execute: {},
  } as QueryBus;

  class MockQueryBus {
    execute(): QueryBus {
      bus.execute = jest.fn();
      return bus;
    }
  }

  beforeEach(async () => {
    Object.assign(qr.manager, { save: jest.fn(), findOne: jest.fn() });

    const module = await Test.createTestingModule({
      providers: [
        FeedService,
        { provide: UserService, useFactory: mockUserService },
        { provide: 'FeedRepository', useFactory: mockRepository },
        { provide: 'FeedLikeRepository', useFactory: mockRepository },
        { provide: 'UserRepository', useFactory: mockRepository },
        { provide: QueryBus, useClass: MockQueryBus },
        { provide: DataSource, useClass: MockDataSource },
      ],
    }).compile();

    feedService = module.get<FeedService>(FeedService);
    userService = module.get<UserService>(UserService);
    feedRepository = module.get('FeedRepository') as MockRepository<Feed>;
    feedLikeRepository = module.get(
      'FeedLikeRepository',
    ) as MockRepository<FeedLike>;
    userRepository = module.get('UserRepository') as MockRepository<User>;
    dataSource = module.get<DataSource>(DataSource);
  });

  it('피드,유저 서비스 toBeDefined 테스트', () => {
    expect(feedService).toBeDefined();
    expect(userService).toBeDefined();
  });

  let user: User;
  let currentUser: ICurrentUser;
  let feedId;
  let feed: Feed;
  let createFeedInput: CreateFeedInput;
  let updateFeedInput: UpdateFeedInput;
  let fetchFeedsOutput: FetchFeedsOutput;
  beforeEach(async () => {
    feedId = 1;
    createFeedInput = {
      title: '여행가고 싶은 날이네요',
      content: '날씨가 너무 좋아요!',
      hashTags: '#여행,#날씨,#좋음',
    };
    updateFeedInput = {
      title: '축구하고 싶은 날이네요',
      content: '시원한데 비가 올거같아 걱정',
      hashTags: '#축구,#날씨,#비,#걱정',
    };
    fetchFeedsOutput = {
      feeds: [feed],
      order: OrderOption.ASC,
      sort: SortOption.CREATEDAT,
      filter: ['날씨', '좋음'],
      page: 1,
      pageCount: 10,
      search: '여행',
      total: 1,
    };

    user = {
      email: 'test1234@mail.com',
      password: '1234abcd',
      posts: [],
      createdAt: new Date('2022-07-06T14:49:09.929Z'),
      updatedAt: new Date('2022-07-07T14:49:09.929Z'),
    };

    currentUser = {
      email: 'test1234@mail.com',
      createdAt: new Date('2022-07-06T14:49:09.929Z'),
    };

    feed = {
      id: 1,
      title: '여행가고 싶은 날이네요',
      content: '날씨가 너무 좋아요!',
      hashTags: '#여행,#날씨,#좋음',
      createdAt: new Date('2022-07-13T14:49:09.929Z'),
      updatedAt: new Date('2022-07-14T14:49:09.929Z'),
      deletedAt: new Date('2022-07-15T14:49:09.929Z'),
      likeCount: 1,
      watchCount: 12,
      user: {
        email: 'test1234@mail.com',
        password: '1234abcd',
        posts: [],
        createdAt: new Date('2022-07-06T14:49:09.929Z'),
        updatedAt: new Date('2022-07-07T14:49:09.929Z'),
      },
    };
    user.posts = [feed];
    jest.spyOn(userService, 'fetch').mockResolvedValue(user);
  });

  describe('게시글 생성', () => {
    it('toBeDefined 테스트', () => {
      expect(feedService.create).toBeDefined();
    });

    it('결과값 검증', async () => {
      jest.spyOn(feedService, 'create').mockResolvedValue(feed);
      jest.spyOn(feedRepository, 'save').mockResolvedValue(feed);

      const result = await feedService.create({ currentUser, createFeedInput });
      expect(result).toEqual(feed);
    });
  });

  describe('게시글 수정', () => {
    it('toBeDefined 테스트', () => {
      expect(feedService.update).toBeDefined();
    });
    it('결과값 검증', async () => {
      feed = { ...feed, ...updateFeedInput };
      jest.spyOn(feedRepository, 'findOne').mockResolvedValue(feed);
      jest.spyOn(feedRepository, 'save').mockResolvedValue(feed);

      const result = await feedService.update({
        feedId,
        currentUser,
        updateFeedInput,
      });
      expect(result).toEqual(feed);
    });
    it('에러 테스트 : 게시글이 존재하지 않을시 에러', async () => {
      try {
        jest.spyOn(feedRepository, 'findOne').mockResolvedValue(undefined);
        await feedService.update({ feedId, currentUser, updateFeedInput });
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(ErrorType.feed.notFound.msg);
      }
    });
    it('에러 테스트 : 기존 작성자와 수정자가 다를시 에러', async () => {
      try {
        feed.user.email = 'notmine@mail.com';
        jest.spyOn(userService, 'fetch').mockResolvedValue(user);
        jest.spyOn(feedRepository, 'findOne').mockResolvedValue(feed);
        jest.spyOn(feedRepository, 'save').mockResolvedValue(feed);

        await feedService.update({ feedId, currentUser, updateFeedInput });
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe(ErrorType.feed.notYours.msg);
      }
    });
  });

  describe('게시글 삭제', () => {
    it('toBeDefined 테스트', () => {
      expect(feedService.delete).toBeDefined();
    });
    it('결과값 검증', async () => {
      jest.spyOn(feedRepository, 'findOne').mockResolvedValue(feed);
      const softDeleteResult = { affected: true };
      jest
        .spyOn(feedRepository, 'softDelete')
        .mockResolvedValue(softDeleteResult);
      const result = await feedService.delete({ currentUser, feedId });
      expect(result).toEqual(true);
    });
    it('에러 테스트 : 게시글이 존재하지 않을시 에러', async () => {
      try {
        jest.spyOn(feedRepository, 'findOne').mockResolvedValue(undefined);
        await feedService.delete({ feedId, currentUser });
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(ErrorType.feed.notFound.msg);
      }
    });
    it('에러 테스트 : 기존 작성자와 수정자가 다를시 에러', async () => {
      try {
        feed.user.email = 'notmine@mail.com';
        jest.spyOn(feedRepository, 'findOne').mockResolvedValue(feed);
        jest.spyOn(feedRepository, 'save').mockResolvedValue(feed);

        await feedService.delete({ feedId, currentUser });
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe(ErrorType.feed.notYours.msg);
      }
    });
  });

  describe('게시글 복구', () => {
    it('toBeDefined 테스트', () => {
      expect(feedService.restore).toBeDefined();
    });
    it('결과값 검증', async () => {
      jest.spyOn(feedRepository, 'findOne').mockResolvedValue(feed);
      const restoreResult = { affected: true };
      jest.spyOn(feedRepository, 'restore').mockResolvedValue(restoreResult);
      const result = await feedService.restore({ currentUser, feedId });
      expect(result).toEqual(true);
    });
    it('에러 테스트 : 게시글이 존재하지 않을시 에러', async () => {
      try {
        jest.spyOn(feedRepository, 'findOne').mockResolvedValue(undefined);
        await feedService.restore({ feedId, currentUser });
      } catch (e) {
        expect(e).toBeInstanceOf(NotFoundException);
        expect(e.message).toBe(ErrorType.feed.notFound.msg);
      }
    });
    it('에러 테스트 : 기존 작성자와 수정자가 다를시 에러', async () => {
      try {
        feed.user.email = 'notmine@mail.com';
        jest.spyOn(feedRepository, 'findOne').mockResolvedValue(feed);
        jest.spyOn(feedRepository, 'save').mockResolvedValue(feed);

        await feedService.restore({ feedId, currentUser });
      } catch (e) {
        expect(e).toBeInstanceOf(ForbiddenException);
        expect(e.message).toBe(ErrorType.feed.notYours.msg);
      }
    });
  });

  describe('게시글 좋아요', () => {
    it('toBeDefined 테스트', () => {
      expect(feedService.like).toBeDefined();
    });
    it('결과값 검증 : 좋아요 상태가 true일 경우', async () => {
      const queryRunner = dataSource.createQueryRunner();
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      jest.spyOn(queryRunner.manager, 'findOne').mockResolvedValue(feed);
      const feedLike: FeedLike = { feed, id: '1', isLike: true, user };
      jest
        .spyOn(feedLikeRepository.createQueryBuilder(), 'getOne')
        .mockResolvedValue(feedLike);
      const qbSpyOnLeftJoin = jest.spyOn(
        feedLikeRepository.createQueryBuilder(),
        'leftJoin',
      );
      const qbSpyOnWhere = jest.spyOn(
        feedLikeRepository.createQueryBuilder(),
        'where',
      );
      const qbSpyOnAndWhere = jest.spyOn(
        feedLikeRepository.createQueryBuilder(),
        'andWhere',
      );
      const qbSpyOnGetOne = jest.spyOn(
        feedLikeRepository.createQueryBuilder(),
        'getOne',
      );

      const qrSpyOnFindOne = jest.spyOn(queryRunner.manager, 'findOne');
      const qrSpyOnSave = jest.spyOn(queryRunner.manager, 'save');
      qrSpyOnSave.mockResolvedValueOnce(feedLike);
      qrSpyOnSave.mockResolvedValueOnce(feed);
      jest.spyOn(feedLikeRepository, 'create').mockResolvedValue(feedLike);

      const qrSpyOnCommit = jest.spyOn(queryRunner, 'commitTransaction');
      const qrSpyOnRollback = jest.spyOn(queryRunner, 'rollbackTransaction');
      const qrSpyOnRelease = jest.spyOn(queryRunner, 'release');
      const result = await feedService.like({ currentUser, feedId });

      expect(result).toEqual(false);

      expect(qbSpyOnLeftJoin).toHaveBeenCalledTimes(2);
      expect(qbSpyOnWhere).toHaveBeenCalledTimes(1);
      expect(qbSpyOnAndWhere).toHaveBeenCalledTimes(1);
      expect(qbSpyOnGetOne).toHaveBeenCalledTimes(1);
      expect(qrSpyOnFindOne).toHaveBeenCalledTimes(1);
      expect(qrSpyOnSave).toHaveBeenCalledTimes(2);
      expect(qrSpyOnCommit).toHaveBeenCalledTimes(1);
      expect(qrSpyOnRollback).toHaveBeenCalledTimes(0);
      expect(qrSpyOnRelease).toHaveBeenCalledTimes(1);
    });
  });

  describe('게시글 상세조회', () => {
    it('toBeDefined 테스트', () => {
      expect(feedService.findOne).toBeDefined();
    });
  });

  describe('게시글 목록조회', () => {
    it('toBeDefined 테스트', () => {
      expect(feedService.findList).toBeDefined();
    });
  });
});
