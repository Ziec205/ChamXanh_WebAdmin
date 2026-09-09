import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { createHash, randomBytes } from 'node:crypto';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDungDocument } from './schemas/nguoi-dung.schema';
import {
  RefreshTokenNguoiDung,
  RefreshTokenNguoiDungDocument,
} from './schemas/refresh-token-nguoi-dung.schema';
import { DangKyDto } from './dto/dang-ky.dto';
import { DangNhapAppDto } from './dto/dang-nhap-app.dto';
import { DoiMatKhauAppDto } from './dto/doi-mat-khau-app.dto';
import { ttlSangMiliGiay } from 'src/common/utils/ttl.util';

const LOI_DANG_NHAP = 'Email hoặc mật khẩu không đúng.';

export interface KetQuaDangNhapApp {
  accessToken: string;
  refreshToken: string;
  nguoiDung: { id: string; email: string; hoTen: string };
}

@Injectable()
export class NguoiDungAuthService {
  constructor(
    private readonly nguoiDungService: NguoiDungService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @InjectModel(RefreshTokenNguoiDung.name)
    private readonly refreshModel: Model<RefreshTokenNguoiDungDocument>,
  ) {}

  async dangKy(dto: DangKyDto, thietBi = ''): Promise<KetQuaDangNhapApp> {
    const nd = await this.nguoiDungService.dangKy(dto.email, dto.matKhau, dto.hoTen);
    return this.phatToken(nd, thietBi);
  }

  async dangNhap(dto: DangNhapAppDto, thietBi = ''): Promise<KetQuaDangNhapApp> {
    const nd = await this.nguoiDungService.findByEmailWithPassword(dto.email);
    if (!nd) throw new UnauthorizedException(LOI_DANG_NHAP);

    if (this.nguoiDungService.dangBiKhoaTam(nd)) {
      throw new UnauthorizedException(
        'Tài khoản tạm bị khoá do đăng nhập sai nhiều lần. Vui lòng thử lại sau 15 phút.',
      );
    }
    if (!nd.dangHoatDong) {
      throw new UnauthorizedException('Tài khoản đã bị khoá. Liên hệ hỗ trợ nếu đây là nhầm lẫn.');
    }

    const khop = await this.nguoiDungService.soSanhMatKhau(dto.matKhau, nd.matKhauBam);
    if (!khop) {
      await this.nguoiDungService.ghiNhanDangNhapSai(nd);
      throw new UnauthorizedException(LOI_DANG_NHAP);
    }

    await this.nguoiDungService.ghiNhanDangNhapThanhCong(String(nd._id));
    return this.phatToken(nd, thietBi);
  }

  async lamMoiToken(refreshToken: string, thietBi = ''): Promise<KetQuaDangNhapApp> {
    const tokenBam = this.bamToken(refreshToken);
    const banGhi = await this.refreshModel.findOne({ tokenBam }).exec();

    if (!banGhi || banGhi.thuHoiLuc || banGhi.hetHanLuc.getTime() < Date.now()) {
      throw new UnauthorizedException('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }

    const nd = await this.nguoiDungService.chiTiet(String(banGhi.nguoiDungId)).catch(() => null);
    if (!nd || !nd.dangHoatDong) {
      throw new UnauthorizedException('Tài khoản không còn hiệu lực.');
    }

    banGhi.thuHoiLuc = new Date();
    await banGhi.save();

    return this.phatToken(nd, thietBi);
  }

  async doiMatKhau(id: string, dto: DoiMatKhauAppDto): Promise<void> {
    const nd = await this.nguoiDungService.findByIdWithPassword(id);
    if (!nd) throw new UnauthorizedException('Tài khoản không còn hiệu lực.');

    const dung = await this.nguoiDungService.soSanhMatKhau(dto.matKhauHienTai, nd.matKhauBam);
    if (!dung) throw new UnauthorizedException('Mật khẩu hiện tại không đúng.');
    if (dto.matKhauHienTai === dto.matKhauMoi) {
      throw new BadRequestException('Mật khẩu mới phải khác mật khẩu hiện tại.');
    }

    await this.nguoiDungService.doiMatKhauApp(id, dto.matKhauMoi);
    await this.dangXuatMoiThietBi(id);
  }

  /** Apple 5.1.1v: xoá vĩnh viễn ngay trong app, bắt gõ lại mật khẩu trước khi xoá. */
  async xoaTaiKhoan(id: string, matKhau: string): Promise<void> {
    const nd = await this.nguoiDungService.findByIdWithPassword(id);
    if (!nd) throw new UnauthorizedException('Tài khoản không còn hiệu lực.');

    const dung = await this.nguoiDungService.soSanhMatKhau(matKhau, nd.matKhauBam);
    if (!dung) throw new UnauthorizedException('Mật khẩu không đúng.');

    await this.dangXuatMoiThietBi(id);
    await this.nguoiDungService.xoaVinhVien(id);
  }

  async dangXuat(refreshToken: string): Promise<void> {
    await this.refreshModel
      .updateOne({ tokenBam: this.bamToken(refreshToken) }, { thuHoiLuc: new Date() })
      .exec();
  }

  async dangXuatMoiThietBi(nguoiDungId: string): Promise<void> {
    await this.refreshModel
      .updateMany(
        { nguoiDungId: new Types.ObjectId(nguoiDungId), thuHoiLuc: null },
        { thuHoiLuc: new Date() },
      )
      .exec();
  }

  private async phatToken(nd: NguoiDungDocument, thietBi: string): Promise<KetQuaDangNhapApp> {
    const accessToken = await this.jwt.signAsync(
      { sub: String(nd._id), email: nd.email },
      {
        secret: this.config.get<string>('jwtApp.accessSecret'),
        expiresIn: ttlSangMiliGiay(this.config.get<string>('jwtApp.accessTtl')!) / 1000,
      },
    );

    const refreshToken = randomBytes(48).toString('base64url');
    await this.refreshModel.create({
      nguoiDungId: nd._id,
      tokenBam: this.bamToken(refreshToken),
      hetHanLuc: new Date(Date.now() + ttlSangMiliGiay(this.config.get<string>('jwtApp.refreshTtl')!)),
      thietBi: thietBi.slice(0, 200),
    });

    return {
      accessToken,
      refreshToken,
      nguoiDung: { id: String(nd._id), email: nd.email, hoTen: nd.hoTen },
    };
  }

  private bamToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
