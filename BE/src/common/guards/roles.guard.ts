import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AdminRole } from 'src/modules/admin-users/schemas/admin-user.schema';
import { AuthenticatedUser } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Không khai báo @Roles nghĩa là mọi vai đã đăng nhập đều vào được.
    if (!required || required.length === 0) return true;

    const user = context.switchToHttp().getRequest().user as AuthenticatedUser | undefined;
    if (!user) return false;

    if (!required.includes(user.role)) {
      throw new ForbiddenException(
        `Chức năng này chỉ dành cho vai: ${required.join(', ')}. Tài khoản của bạn là: ${user.role}.`,
      );
    }
    return true;
  }
}
