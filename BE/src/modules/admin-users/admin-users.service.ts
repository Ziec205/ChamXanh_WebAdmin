import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AdminUser, AdminUserDocument, AdminRole } from './schemas/admin-user.schema';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

const BCRYPT_ROUNDS = 12;
const SO_LAN_SAI_TOI_DA = 5;
const THOI_GIAN_KHOA_PHUT = 15;

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(AdminUser.name) private readonly model: Model<AdminUserDocument>,
  ) {}

  async taoMoi(dto: CreateAdminUserDto): Promise<AdminUserDocument> {
    const daTonTai = await this.model.exists({ email: dto.email.toLowerCase() });
    if (daTonTai) {
      throw new ConflictException(`Email ${dto.email} đã được dùng cho một tài khoản khác.`);
    }
    const matKhauBam = await bcrypt.hash(dto.matKhau, BCRYPT_ROUNDS);
    return this.model.create({
      email: dto.email.toLowerCase(),
      matKhauBam,
      hoTen: dto.hoTen,
      vaiTro: dto.vaiTro,
    });
  }

  findAll() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  async findById(id: string) {
    const nguoiDung = await this.model.findById(id).exec();
    if (!nguoiDung) throw new NotFoundException('Không tìm thấy tài khoản quản trị này.');
    return nguoiDung;
  }

  /** Lấy kèm mật khẩu băm — chỉ dùng trong luồng đăng nhập. */
  findByEmailWithPassword(email: string) {
    return this.model.findOne({ email: email.toLowerCase() }).select('+matKhauBam').exec();
  }

  soSanhMatKhau(matKhauTho: string, matKhauBam: string) {
    return bcrypt.compare(matKhauTho, matKhauBam);
  }

  dangBiKhoa(nguoiDung: AdminUserDocument): boolean {
    return !!nguoiDung.khoaToi && nguoiDung.khoaToi.getTime() > Date.now();
  }

  async ghiNhanDangNhapSai(nguoiDung: AdminUserDocument) {
    const soLan = nguoiDung.soLanDangNhapSai + 1;
    const capNhat: Record<string, unknown> = { soLanDangNhapSai: soLan };
    if (soLan >= SO_LAN_SAI_TOI_DA) {
      capNhat.khoaToi = new Date(Date.now() + THOI_GIAN_KHOA_PHUT * 60_000);
      capNhat.soLanDangNhapSai = 0;
    }
    await this.model.updateOne({ _id: nguoiDung._id }, capNhat).exec();
  }

  async ghiNhanDangNhapThanhCong(id: string) {
    await this.model
      .updateOne({ _id: id }, { lanDangNhapCuoi: new Date(), soLanDangNhapSai: 0, khoaToi: null })
      .exec();
  }

  /** Đổi mật khẩu. Gọi xong PHẢI thu hồi mọi phiên đăng nhập cũ. */
  async doiMatKhau(id: string, matKhauMoi: string): Promise<void> {
    const matKhauBam = await bcrypt.hash(matKhauMoi, BCRYPT_ROUNDS);
    await this.model.updateOne({ _id: id }, { matKhauBam }).exec();
  }

  /** Lấy kèm mật khẩu băm theo id — dùng khi xác nhận mật khẩu hiện tại. */
  findByIdWithPassword(id: string) {
    return this.model.findById(id).select('+matKhauBam').exec();
  }

  async doiTrangThai(id: string, dangHoatDong: boolean) {
    const nguoiDung = await this.findById(id);
    nguoiDung.dangHoatDong = dangHoatDong;
    return nguoiDung.save();
  }

  demTheoVai(vaiTro: AdminRole) {
    return this.model.countDocuments({ vaiTro }).exec();
  }
}
