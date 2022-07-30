import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { ErrorType } from 'src/utils/response/error.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(readonly configService: ConfigService, readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET', process.env.JWT_SECRET),
    });
  }

  async validate(payload: { sub: User['id'] }): Promise<User> {
    console.log('payload', payload);
    if (payload?.sub) {
      const user = await this.userService.findOneById(payload.sub);

      if (user) {
        return user;
      }
    }

    throw new UnauthorizedException(ErrorType.unauthorizedUser);
  }
}
