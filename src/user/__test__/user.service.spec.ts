import { HttpException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { Repository, UpdateResult } from 'typeorm';
import { User } from '../entity/user.entity';
import { UserService } from '../user.service';
import * as bcrypt from 'bcryptjs';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockUserRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn().mockReturnThis(),
  }),
};
describe('UserService', () => {
  let service: UserService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(getRepositoryToken(User));
  });

  const user = new User();
  user.id = 1;
  user.email = 'tester@mail.com';
  user.nickname = 'tester';
  user.password = 'hashedPassword';

  const userId = 1;
  const email = 'tester@mail.com';
  const refreshToken = 'JwtRefreshToken';

  describe('createUser', () => {
    it('유저를 생성하고 반환합니다.', async () => {
      userRepository.create.mockResolvedValue(user);
      userRepository.save.mockResolvedValue(user);

      const result = await service.createUser('tester@mail.com', 'tester', 'hashedPssword');

      expect(result).toEqual(user);
    });
  });

  describe('getUserByEmail', () => {
    it('사용자를 찾을 수 없다면 예외를 던집니다.', async () => {
      jest.spyOn(userRepository.createQueryBuilder(), 'getOne').mockResolvedValue(undefined);

      const result = async () => {
        await service.getUserByEmail('test@mail.com');
      };

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.userNotFound.message, ErrorType.userNotFound.code)
      );
    });

    it('이메일로 사용자를 찾고 반환합니다.', async () => {
      jest.spyOn(userRepository.createQueryBuilder(), 'leftJoinAndSelect');
      jest.spyOn(userRepository.createQueryBuilder(), 'where');
      jest.spyOn(userRepository.createQueryBuilder(), 'getOne').mockResolvedValue(user);
      
      const result = await service.getUserByEmail(email);

      expect(userRepository.createQueryBuilder().leftJoinAndSelect).toHaveBeenCalled();
      expect(userRepository.createQueryBuilder().where).toHaveBeenCalled();
      expect(userRepository.createQueryBuilder().getOne).toHaveBeenCalled();
      expect(result).toEqual(user);
    });
  });

  describe('getUserById', () => {
    it('사용자를 찾을 수 없다면 예외를 던집니다.', async () => {
      userRepository.findOne.mockResolvedValue(undefined);

      const result = async () => {
        await service.getUserById(10);
      };

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.userNotFound.message, ErrorType.userNotFound.code)
      );
    });

    it('ID로 사용자를 찾고 반환합니다.', async () => {
      userRepository.findOne.mockResolvedValue(user);
      const result = await service.getUserById(userId);

      expect(result).toEqual(user);
    });
  });

  describe('setRefreshToken', () => {
    
    it('발급받은 리프레시 토큰을 암호화하여 저장합니다.', async () => {
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue('saltText');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedToken');

      jest.spyOn(userRepository.createQueryBuilder(), 'update');
      jest.spyOn(userRepository.createQueryBuilder(), 'set');
      jest.spyOn(userRepository.createQueryBuilder(), 'where');
      jest.spyOn(userRepository.createQueryBuilder(), 'execute');

      const result = await service.setRefreshToken(refreshToken, email);

      expect(result).toBeUndefined();
    });
  });

  describe('getUserIfRefreshTokenMatched', () => {
    it('리프레시 토큰이 일치하지 않는다면 예외를 던집니다.', async () => {
      jest.spyOn(service, 'getUserByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = async () => {
        await service.getUserIfRefreshTokenMatched('wrongToken', email);
      }

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.unauthorized.message, ErrorType.unauthorized.code)
      );
    });

    it('리프레시 토큰이 일치한다면 유저를 반환합니다.', async () => {
      jest.spyOn(service, 'getUserByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await service.getUserIfRefreshTokenMatched(refreshToken, email);
      
      expect(result).toEqual(user);
    });
  });

  describe('removeRefreshToken', () => {
    it('로그아웃 시 Refresh Token 값을 null로 변경합니다.', async () => {
      userRepository.update.mockResolvedValue(UpdateResult);

      const result = await service.removeRefreshToken(userId);

      expect(userRepository.update).toHaveBeenCalledWith(userId, { hashedRefreshToken: null });
      expect(result).toBeUndefined();
    });
  })
});
