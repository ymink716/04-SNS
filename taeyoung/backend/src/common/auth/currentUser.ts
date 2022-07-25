import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface ICurrentUser {
  email: string;
  createdAt: Date;
}

export const CurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext): ICurrentUser => {
    const req = context.switchToHttp().getRequest();
    return req.user;
  },
);
