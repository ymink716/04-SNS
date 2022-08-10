import { HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ErrorType } from 'src/common/exception/error-type.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
  
  /**
   * @description 인증안된 사용자도 접근 가능한 라우터 -> allowAny 
  */
  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();       

    const allowAny = this.reflector.get<string[]>('allow-any', context.getHandler());
    if (user) return user;
    if (allowAny) return null;
    throw new HttpException(ErrorType.unauthorized.message, ErrorType.unauthorized.code);
  }
}
