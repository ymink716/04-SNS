import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor() {
    super({
      jwtFromRequest: (req) => req.headers.cookie.replace('refreshToken=', ''),
      // 쿠키에서 리프레시 토큰을 가져와 검증
      secretOrKey: process.env.JWT_REFRESH_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const refreshToken = await req.headers.cookie.replace('refreshToken=', '');
    if (!refreshToken)
      throw new UnauthorizedException('리프레시 토큰이 없습니다');

    return { email: payload.email, createdAt: payload.createdAt };
  }
}
