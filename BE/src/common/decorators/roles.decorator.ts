import { SetMetadata } from '@nestjs/common';
import { AdminRole } from 'src/modules/admin-users/schemas/admin-user.schema';

export const ROLES_KEY = 'roles';

/** Giới hạn endpoint cho một số vai nhất định. Dùng kèm RolesGuard. */
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
