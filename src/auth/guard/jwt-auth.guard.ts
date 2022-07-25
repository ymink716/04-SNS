import { HttpException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ErrorType } from 'src/utils/error-type.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }
    
  handleRequest(err, user, info, context) {
    const request = context.switchToHttp().getRequest();       

    const allowAny = this.reflector.get<string[]>('allow-any', context.getHandler());
    if (user) return user;
    if (allowAny) return true;
    throw new HttpException(ErrorType.unauthorized.message, ErrorType.unauthorized.code);
  }
}
