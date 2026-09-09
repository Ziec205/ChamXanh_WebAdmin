import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash, randomBytes } from 'node:crypto';
import { AdminUsersService } from 'src/modules/admin-users/admin-users.service';
import { AdminUserDocument } from 'src/modules/admin-users/schemas/admin-user.schema';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';
import { LoginDto } from './dto/login.dto';
import { ttlSangMiliGiay } from 'src/common/utils/ttl.util';

/**
 * Thông báo dùng chung cho mọi trường hợp đăng nhập thất bại.
 * Không tiết lộ email có tồn tại hay không — tránh dò tài khoản.
 */
const LOI_DANG_NHAP = 'Email hoặc mật khẩu không đúng.';

export interface KetQuaDangNhap {
  accessToken: string;
  refreshToken: string;
  nguoiDung: {
    id: string;
    email: string;
    hoTen: string;
    vaiTro: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly adminUsers: AdminUsersService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectModel(RefreshToken.name)
    private readonly refreshModel: Model<RefreshTokenDocument>,
  ) {}

  async dangNhap(dto: LoginDto, thietBi = ''): Promise<KetQuaDangNhap> {
    const nguoiDung = await this.adminUsers.findByEmailWithPassword(dto.email);
    if (!nguoiDung) throw new UnauthorizedException(LOI_DANG_NHAP);

    if (this.adminUsers.dangBiKhoa(nguoiDung)) {
      throw new UnauthorizedException(
        'Tài khoản tạm bị khoá do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.',
      );
    }

    if (!nguoiDung.dangHoatDong) {
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hoá. Liên hệ quản trị viên.');
    }

    const khop = await this.adminUsers.soSanhMatKhau(dto.matKhau, nguoiDung.matKhauBam);
    if (!khop) {
      await this.adminUsers.ghiNhanDangNhapSai(nguoiDung);
      throw new UnauthorizedException(LOI_DANG_NHAP);
    }

    await this.adminUsers.ghiNhanDangNhapThanhCong(String(nguoiDung._id));
    return this.phatToken(nguoiDung, thietBi);
  }

  async lamMoiToken(refreshToken: string, thietBi = ''): Promise<KetQuaDangNhap> {
    const tokenBam = this.bamToken(refreshToken);
    const banGhi = await this.refreshModel.findOne({ tokenBam }).exec();

    if (!banGhi || banGhi.thuHoiLuc || banGhi.hetHanLuc.getTime() < Date.now()) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const nguoiDung = await this.adminUsers.findById(String(banGhi.adminUserId)).catch(() => null);
    if (!nguoiDung || !nguoiDung.dangHoatDong) {
      throw new UnauthorizedException('Tài khoản không còn hiệu lực.');
    }

    // Xoay vòng: token cũ bị thu hồi ngay khi phát token mới.
    banGhi.thuHoiLuc = new Date();
    await banGhi.save();

    return this.phatToken(nguoiDung, thietBi);
  }

  async dangXuat(refreshToken: string): Promise<void> {
    await this.refreshModel
      .updateOne({ tokenBam: this.bamToken(refreshToken) }, { thuHoiLuc: new Date() })
      .exec();
  }

  /** Thu hồi toàn bộ phiên của một tài khoản — dùng khi đổi mật khẩu hoặc nghi bị chiếm. */
  async dangXuatMoiThietBi(adminUserId: string): Promise<void> {
    await this.refreshModel
      .updateMany(
        { adminUserId: new Types.ObjectId(adminUserId), thuHoiLuc: null },
        { thuHoiLuc: new Date() },
      )
      .exec();
  }

  private async phatToken(
    nguoiDung: AdminUserDocument,
    thietBi: string,
  ): Promise<KetQuaDangNhap> {
    const accessToken = await this.jwt.signAsync(
      { sub: String(nguoiDung._id), email: nguoiDung.email, vaiTro: nguoiDung.vaiTro },
      {
        secret: this.config.get<string>('jwt.accessSecret'),
        // Quy về giây: tránh lệ thuộc kiểu chuỗi của jsonwebtoken và dùng lại hàm đã kiểm thử.
        expiresIn: ttlSangMiliGiay(this.config.get<string>('jwt.accessTtl')!) / 1000,
      },
    );

    // Refresh token là chuỗi ngẫu nhiên, không phải JWT: thu hồi được ngay lập tức.
    const refreshToken = randomBytes(48).toString('base64url');

    await this.refreshModel.create({
      adminUserId: nguoiDung._id,
      tokenBam: this.bamToken(refreshToken),
      hetHanLuc: new Date(Date.now() + ttlSangMiliGiay(this.config.get<string>('jwt.refreshTtl')!)),
      thietBi: thietBi.slice(0, 200),
    });

    return {
      accessToken,
      refreshToken,
      nguoiDung: {
        id: String(nguoiDung._id),
        email: nguoiDung.email,
        hoTen: nguoiDung.hoTen,
        vaiTro: nguoiDung.vaiTro,
      },
    };
  }

  private bamToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

}
