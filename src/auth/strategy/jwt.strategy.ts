import { HttpException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/user.entity';
import { ErrorType } from 'src/utils/error.enum';
import { Repository } from 'typeorm';

/**
  * @description passport jwt strategy를 구체화
*/
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request) => {
          return request?.cookies?.Authentication; // 쿠키를 확인
        },
      ]),
      ignoreExpiration: false, // 만료시간을 무시하지 않음
      secretOrKey: process.env.JWT_SECRET_KEY,
    });
  }

  // 유효한 사용자인지 학인
  async validate(payload) {
    const { email } = payload;

    const user: User = await this.userRepository.findOne({where: { email }});

    if (!user) {
      throw new HttpException(ErrorType.unAuthorized.message, ErrorType.unAuthorized.code);
    }

    return user;
  }
}
