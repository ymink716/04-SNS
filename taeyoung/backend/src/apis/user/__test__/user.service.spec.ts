import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ErrorType } from 'src/common/type/error.type';
import { Repository } from 'typeorm';
import { CreateUserInput } from '../dto/createUser.input';
import { User } from '../entities/user.entity';
import { UserService } from '../user.service';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
});

describe('UserService', () => {
  let userService: UserService;
  let userRepository: MockRepository<User>;
  let user: User;
  let createUserInput: CreateUserInput;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: 'UserRepository', useFactory: mockRepository },
      ],
    }).compile();
    userService = module.get<UserService>(UserService);
    userRepository = module.get('UserRepository') as MockRepository<User>;

    user = {
      email: 'test1234@mail.com',
      password: '1234abcd',
      posts: [],
      createdAt: new Date('2022-07-06T14:49:09.929Z'),
      updatedAt: new Date('2022-07-07T14:49:09.929Z'),
    };
    createUserInput = {
      email: 'test1234@mail.com',
      password: '1234abcd',
      passwordConfirm: '1234abcd',
    };
  });

  it('유저 서비스 toBeDefined 테스트', () => {
    expect(userService).toBeDefined();
  });

  describe('유저 생성 / 회원가입', () => {
    it('toBeDefined 테스트', () => {
      expect(userService.signup).toBeDefined();
    });
    it('결과값 검증', async () => {
      jest.spyOn(userService, 'fetch').mockResolvedValue(undefined);
      jest.spyOn(userRepository, 'save').mockResolvedValue(user);
      const result = await userService.signup({ createUserInput });

      expect(result).toEqual(user);
    });
    it('에러 테스트 : 해당 이메일로 가입된 유저가 존재할시 에러', async () => {
      try {
        jest.spyOn(userService, 'fetch').mockResolvedValue(user);
        await userService.signup({ createUserInput });
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe(ErrorType.user.emailExist.msg);
      }
    });
    it('에러 테스트 : 비밀번호와 확인 비밀번호가 다를시 에러', async () => {
      try {
        jest.spyOn(userService, 'fetch').mockResolvedValue(undefined);
        createUserInput.passwordConfirm = 'notSame';
        await userService.signup({ createUserInput });
      } catch (e) {
        expect(e).toBeInstanceOf(BadRequestException);
        expect(e.message).toBe(ErrorType.user.passwordDoesNotMatch.msg);
      }
    });
  });

  describe('유저 조회', () => {
    it('toBeDefined 테스트', () => {
      expect(userService.fetch).toBeDefined();
    });
    it('결과값 검증', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      const result = await userService.fetch({ email: user.email });

      expect(result).toEqual(user);
    });
  });
});
