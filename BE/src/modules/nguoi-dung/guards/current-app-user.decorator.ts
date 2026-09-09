import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedAppUser {
  id: string;
  email: string;
}

export const CurrentAppUser = createParamDecorator(
  (data: keyof AuthenticatedAppUser | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user as AuthenticatedAppUser;
    return data ? user?.[data] : user;
  },
);
