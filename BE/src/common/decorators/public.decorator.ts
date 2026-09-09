import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Đánh dấu endpoint không cần đăng nhập.
 * Mặc định TOÀN BỘ endpoint đều yêu cầu xác thực — quên đánh dấu thì bị chặn,
 * an toàn hơn là quên bảo vệ.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
