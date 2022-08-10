import { HttpException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';
import { ErrorType } from 'src/common/exception/error-type.enum';

/**
  * @description passport jwt strategy를 구체화
*/
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.Authentication; // 쿠키를 확인
        },
      ]),
      ignoreExpiration: false, // 만료시간을 무시하지 않음
      secretOrKey: process.env.JWT_ACCESS_TOKEN_SECRET,
    });
  }

  // 유효한 사용자인지 학인
  async validate(payload) {
    const { email } = payload;
    
    const user: User = await this.userService.getUserByEmail(email);
    
    if (!user) {
      throw new HttpException(ErrorType.unauthorized.message, ErrorType.unauthorized.code);
    }

    return user;
  }
}
