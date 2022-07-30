import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { AuthService } from '../auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, JwtService],
    }).compile();
    authService = module.get<AuthService>(AuthService);
  });

  it('인증 서비스 toBeDefined 테스트', () => {
    expect(authService).toBeDefined();
  });

  describe('비밀번호 검증', () => {
    it('toBeDefined 테스트', () => {
      expect(authService.validatePassword).toBeDefined();
    });
    it('결과값 검증 : true', async () => {
      const plainPW = 'password1234';
      const hashedPW =
        '$2b$10$FJUBRkl0xGSXsfpgHlV0FuJAUhrh4lLA/PzwV0jfIUxw3kRyzc8yy';
      const result = await authService.validatePassword({
        plainPW,
        hashedPW,
      });
      expect(result).toEqual(true);
    });

    it('결과값 검증 : false', async () => {
      const plainPW = 'password1234';
      const hashedPW = '$2b$10$FJUBRkl0xGSXsfpgHlV0FuJAUhrh4lLA/';
      const result = await authService.validatePassword({
        plainPW,
        hashedPW,
      });
      expect(result).toEqual(false);
    });
  });
  describe('리프레시 토큰 세팅', () => {
    it('toBeDefined 테스트', () => {
      expect(authService.setRefreshToken).toBeDefined();
    });
  });
  describe('액세스 토큰 발급', () => {
    it('toBeDefined 테스트', () => {
      expect(authService.getAccessToken).toBeDefined();
    });
  });
});
