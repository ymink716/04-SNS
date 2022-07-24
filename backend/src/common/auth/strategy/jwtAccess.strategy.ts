import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'access') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // 헤더에서 액세스 토큰을 가져와 검증
      secretOrKey: process.env.JWT_ACCESS_KEY,
      passReqToCallback: true,
    });
  }

  async validate(req, payload) {
    const accessToken = await req.headers.authorization.split(' ')[1];

    if (!accessToken) throw new UnauthorizedException('액세스 토큰이 없습니다');

    return { email: payload.email, createdAt: payload.createdAt };
  }
}
