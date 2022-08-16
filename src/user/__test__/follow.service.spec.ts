import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { DeleteResult, Repository } from 'typeorm';
import { Follow } from '../entity/follow.entity';
import { User } from '../entity/user.entity';
import { FollowService } from '../follow.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockFollowRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  }),
};

describe('FollowService', () => {
  let service: FollowService;
  let followRepository: MockRepository<Follow>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        { provide: getRepositoryToken(Follow), useValue: mockFollowRepository },
      ],
    }).compile();

    service = module.get<FollowService>(FollowService);
    followRepository = module.get(getRepositoryToken(Follow));
  });
  
  const userA = new User();
  userA.id = 1;
  userA.email = 'tester@mail.com',
  userA.nickname = 'tester';

  const userB = new User();
  userA.id = 2;
  userA.email = 'yongmin@mail.com',
  userA.nickname = 'yongmin';

  const follow = new Follow();
  follow.follower = userA;
  follow.following = userB;

  const userId = 1;

  describe('follow', () => {
    it('서로 같은 유저일 경우 예외를 던집니다.', async () => {
      const result = async () => {
        await service.follow(userA, userA);
      };

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.canNotFollowSameUser.message, ErrorType.canNotFollowSameUser.code)
      );
    });

    it('이미 팔로우 관계가 형성된 경우 예외를 던집니다.', async () => {
      followRepository.findOne.mockResolvedValue(follow);

      const result = async () => {
        await service.follow(userA, userB);
      };

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.alreadyFollowed.message, ErrorType.alreadyFollowed.code)
      );
    });

    it('팔로우 관계를 추가하고 DB에 저장합니다.', async () => {
      followRepository.findOne.mockResolvedValue(undefined);
      followRepository.create.mockResolvedValue(follow);
      followRepository.save.mockResolvedValue(follow);

      const result = await service.follow(userA, userB);

      expect(followRepository.create).toHaveBeenCalledWith({ follower: userA, following: userB });      
      expect(followRepository.save).toHaveBeenCalledWith(follow);
      expect(result).toBeUndefined();
    });
  });

  describe('unfollow', () => {
    it('팔로우 관계를 해제합니다.', async () => {
      followRepository.delete.mockResolvedValue(DeleteResult);

      const result = await service.unfollow(userA, userB);

      expect(followRepository.delete).toHaveBeenCalledWith({
        follower: { id: userA.id },
        following: { id: userB.id },
      });
      expect(result).toBeUndefined();
    });
  });

  describe('getFollowers', () => {
    it('유저의 팔로워 목록을 가져옵니다.', async () => {
      jest.spyOn(followRepository.createQueryBuilder(), 'leftJoin');
      jest.spyOn(followRepository.createQueryBuilder(), 'addSelect');
      jest.spyOn(followRepository.createQueryBuilder(), 'where');
      jest.spyOn(followRepository.createQueryBuilder(), 'getMany').mockResolvedValue([]);

      const result = await service.getFollowers(userId);

      expect(followRepository.createQueryBuilder().leftJoin).toHaveBeenCalledTimes(2);
      expect(followRepository.createQueryBuilder().addSelect).toHaveBeenCalledTimes(1);
      expect(followRepository.createQueryBuilder().where).toHaveBeenCalledTimes(1);
      expect(followRepository.createQueryBuilder().getMany).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('getFollowings', () => {
    it('유저의 팔로잉 목록을 가져옵니다.', async () => {
      jest.spyOn(followRepository.createQueryBuilder(), 'leftJoin');
      jest.spyOn(followRepository.createQueryBuilder(), 'addSelect');
      jest.spyOn(followRepository.createQueryBuilder(), 'where');
      jest.spyOn(followRepository.createQueryBuilder(), 'getMany').mockResolvedValue([follow]);

      const result = await service.getFollowings(userId);

      expect(followRepository.createQueryBuilder().leftJoin).toHaveBeenCalled();
      expect(followRepository.createQueryBuilder().addSelect).toHaveBeenCalled();
      expect(followRepository.createQueryBuilder().where).toHaveBeenCalled();
      expect(followRepository.createQueryBuilder().getMany).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
    });
  });
});
