import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validatePassword({ plainPW, hashedPW }): Promise<boolean> {
    return await bcrypt.compare(plainPW, hashedPW);
  }

  async setRefreshToken({ user, res }) {
    const refreshKey = process.env.JWT_REFRESH_KEY;
    const expireTime = process.env.JWT_REFRESH_EXPIRATION_TIME;
    const refreshToken = this.jwtService.sign(
      { email: user.email, createdAt: user.createdAt },
      { secret: refreshKey, expiresIn: expireTime },
    );

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3003');

    res.cookie(
      `refreshToken=${refreshToken}; SameSite=None; Secure=true; httpOnly=true;`,
    );
  }

  async getAccessToken({ user }) {
    const accessKey = process.env.JWT_ACCESS_KEY;
    const expireTime = process.env.JWT_ACCESS_EXPIRATION_TIME;
    return this.jwtService.sign(
      { email: user.email, createdAt: user.createdAt },
      { secret: accessKey, expiresIn: expireTime },
    );
  }
}
