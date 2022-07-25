import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { User } from '../user.entity';

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.user instanceof User ? request.user : null;
  },
);
