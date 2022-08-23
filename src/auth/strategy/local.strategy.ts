import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { HttpException, Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ErrorType } from 'src/common/exception/error-type.enum';

/**
  * @description 로그인 시 사용하는 local strategy
*/
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  // 사용자가 존재하고 유효한지 확인
  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser({ email, password });

    if (!user) {
      throw new HttpException(ErrorType.unauthorized.message, ErrorType.unauthorized.code);
    }

    return user;
  }
}
