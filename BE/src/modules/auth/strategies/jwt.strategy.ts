import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AdminUsersService } from 'src/modules/admin-users/admin-users.service';
import { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  vaiTro: AuthenticatedUser['role'];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly adminUsers: AdminUsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.accessSecret')!,
    });
  }

  /**
   * Đọc lại tài khoản mỗi request thay vì tin hoàn toàn vào payload.
   * Nhờ vậy vô hiệu hoá tài khoản hoặc đổi vai có hiệu lực ngay,
   * không phải chờ access token hết hạn.
   */
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const nguoiDung = await this.adminUsers.findById(payload.sub).catch(() => null);
    if (!nguoiDung || !nguoiDung.dangHoatDong) {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị vô hiệu hoá.');
    }
    return { id: String(nguoiDung._id), email: nguoiDung.email, role: nguoiDung.vaiTro };
  }
}
