import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard RIÊNG cho người dùng app — không kế thừa logic @Public() của
 * JwtAuthGuard (admin). Áp dụng thủ công bằng @UseGuards() trên từng route
 * cần định danh người dùng app, sau khi route đó đã @Public() để thoát khỏi
 * guard toàn cục dành cho Web Admin.
 */
@Injectable()
export class JwtAppAuthGuard extends AuthGuard('jwt-app') {}
