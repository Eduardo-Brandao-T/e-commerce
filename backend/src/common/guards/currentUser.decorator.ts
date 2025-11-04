import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserPayload } from 'src/modules/auth/dto/userPayload.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
