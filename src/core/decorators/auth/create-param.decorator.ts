import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();

    const user = request.user;

    if (!user) {
      console.error(
        'No user found. This decorator should be used with AuthGuard',
      );
      return 'unknown_id';
    }

    return user.id;
  },
);

export const Cookies = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request>();

    return data ? req.cookies?.[data] : req.cookies;
  },
);
