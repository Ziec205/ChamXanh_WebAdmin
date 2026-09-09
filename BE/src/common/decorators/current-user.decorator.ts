import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AdminRole } from 'src/modules/admin-users/schemas/admin-user.schema';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: AdminRole;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user as AuthenticatedUser;
    return data ? user?.[data] : user;
  },
);
