import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/entity/user.entity';
import { LoginUserDto } from '../dto/login-user.dto';
import { ErrorType } from 'src/common/exception/error-type.enum';
import { HttpException } from '@nestjs/common';
import { defaultTokenOption } from '../token-option.interface';

const mockUserService = {
  createUser: jest.fn(),
  getUserByEmail: jest.fn(),
};

const mockJwtService = {
  sign: () => {
    return 'jwtToken..';
  },
}

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule],
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService }, 
        { provide: UserService, useValue: mockUserService }
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  const user: User = new User();
  user.id = 1;
  user.email = 'test@mail.com';
  user.password = 'hashedPssword';
  user.nickname = 'tester';

  const email = 'test@mail.com';

  const accessToken = 'accessToken';
  const refreshToken = 'refreshToken';
  const accessOption = defaultTokenOption;
  const refreshOption = defaultTokenOption;

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@mail.com',
      password: 'password1234',
      nickname: 'taster'
    };

    const salt = 'saltText';
    const hashedPassword = 'hashedPassword';

    it('새로운 유저를 생성하고 반환합니다.', async () => {
      jest.spyOn(bcrypt, 'genSalt').mockResolvedValue(salt);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(userService, 'createUser').mockResolvedValue(user);

      const result = await authService.register(createUserDto);

      expect(result).toEqual(user);
    });
  });

  describe('validateUser', () => {
    it('비밀번호가 일치하지 않는다면 예외를 던집니다.', async () => {
      const loginUserDto: LoginUserDto = {
        password: 'wrongPassword',
        email: 'test@mail.com',
      };

      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      const result = async () => {
        await authService.validateUser(loginUserDto);
      };

      expect(result).rejects.toThrowError(
        new HttpException(ErrorType.passwordDoesNotMatch.message, ErrorType.passwordDoesNotMatch.code)
      );
    });

    it('해당 유저를 확인하고 유저를 반환합니다.', async () => {
      const loginUserDto: LoginUserDto = {
        password: 'password1234',
        email: 'test@mail.com',
      };

      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const result = await authService.validateUser(loginUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('getTokens', () => {
    it('access token과 refresh token을 발급합니다.', async () => {
      jest.spyOn(authService, 'getCookieWithAccessToken').mockResolvedValue({
        accessToken, accessOption, ...user
      });
      jest.spyOn(authService, 'getCookieWithRefreshToken').mockResolvedValue({
        refreshToken, refreshOption
      });

      const result = await authService.getTokens(email);

      expect(result.accessToken).toEqual(accessToken);
      expect(result.refreshToken).toEqual(refreshToken);
    });
  });

  describe('getCookieWithAccessToken', () => {
    it('access token을 발급 받고, 쿠키 정보에 넣어 보내줍니다.', async () => {
      jest.spyOn(userService, 'getUserByEmail').mockResolvedValue(user);
      jest.spyOn(jwtService, 'sign');

      const result = await authService.getCookieWithAccessToken(email);
      
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('accessOption');
    });
  });

  describe('getCookieWithRefreshToken', () => {
    it('refresh token을 발급 받고, 쿠키 정보에 넣어 보내줍니다.', async () => {
      jest.spyOn(jwtService, 'sign');

      const result = await authService.getCookieWithRefreshToken(email);
      
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('refreshOption');
    });
  });

  describe('getCookiesForLogOut', () => {
    it('로그아웃 시 쿠키 옵션들을 반환합니다.', async () => {
      const result = authService.getCookiesForLogOut();

      expect(result).toHaveProperty('accessOption');
      expect(result).toHaveProperty('refreshOption');
    });
  });
});
