import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { User } from 'src/entities/user.entity';

export const GetUser = createParamDecorator(
  (data: any, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
