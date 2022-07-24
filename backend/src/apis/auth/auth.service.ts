import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validatePassword({ plainPW, hashedPW }): Promise<boolean> {
    return await bcrypt.compare(plainPW, hashedPW);
  }

  async setRefreshToken({ user, res }) {
    try {
      const refreshKey = process.env.JWT_REFRESH_KEY;
      const expireTime = process.env.JWT_REFRESH_EXPIRATION_TIME;
      const refreshToken = this.jwtService.sign(
        { email: user.email, createdAt: user.createdAt },
        { secret: refreshKey, expiresIn: expireTime },
      );

      res // 리프레시 토큰이 쿠키에 저장되고 유지됩니다
        .setHeader(
          'Access-Control-Allow-Origin',
          `'${process.env.ALLOW_ORIGIN_URL}'`,
        )
        .cookie(
          `refreshToken=${refreshToken}; Domain=${process.env.COOKIE_DOMAIN} SameSite=None; Secure=true; httpOnly=true;`,
        );
    } catch (e) {
      throw new InternalServerErrorException(e.msg);
    }
  }

  async getAccessToken({ user }): Promise<string> {
    try {
      const accessKey = process.env.JWT_ACCESS_KEY;
      const expireTime = process.env.JWT_ACCESS_EXPIRATION_TIME;
      return this.jwtService.sign(
        { email: user.email, createdAt: user.createdAt },
        { secret: accessKey, expiresIn: expireTime },
      );
    } catch (e) {
      throw new InternalServerErrorException(e.msg);
    }
  }
}
