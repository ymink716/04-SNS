import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/*
  - jwt 인증이 유효한지 확인한다.
*/
@Injectable()
export class JwtAccessGuard extends AuthGuard('access') {}
