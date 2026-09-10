import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { NguoiDung, NguoiDungDocument } from './schemas/nguoi-dung.schema';
import { KhoaNguoiDungDto } from './dto/khoa-nguoi-dung.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

const BCRYPT_ROUNDS = 12;
const SO_LAN_SAI_TOI_DA = 5;
const THOI_GIAN_KHOA_PHUT = 15;

@Injectable()
export class NguoiDungService {
  constructor(
    @InjectModel(NguoiDung.name) private readonly model: Model<NguoiDungDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  /** Đăng ký tài khoản mới cho người dùng app — KHÔNG dùng để tạo tài khoản quản trị. */
  async dangKy(email: string, matKhau: string, hoTen?: string) {
    const daTonTai = await this.model.exists({ email: email.toLowerCase() });
    if (daTonTai) throw new ConflictException(`Email ${email} đã được dùng cho một tài khoản khác.`);

    const matKhauBam = await bcrypt.hash(matKhau, BCRYPT_ROUNDS);
    return this.model.create({ email: email.toLowerCase(), matKhauBam, hoTen: hoTen ?? '' });
  }

  /** Lấy kèm mật khẩu băm — chỉ dùng trong luồng đăng nhập/đổi mật khẩu/xoá tài khoản. */
  findByEmailWithPassword(email: string) {
    return this.model.findOne({ email: email.toLowerCase() }).select('+matKhauBam').exec();
  }

  findByIdWithPassword(id: string) {
    return this.model.findById(id).select('+matKhauBam').exec();
  }

  soSanhMatKhau(matKhauTho: string, matKhauBam: string) {
    return bcrypt.compare(matKhauTho, matKhauBam);
  }

  dangBiKhoaTam(nd: NguoiDungDocument): boolean {
    return !!nd.khoaToi && nd.khoaToi.getTime() > Date.now();
  }

  async ghiNhanDangNhapSai(nd: NguoiDungDocument) {
    const soLan = nd.soLanDangNhapSai + 1;
    const capNhat: Record<string, unknown> = { soLanDangNhapSai: soLan };
    if (soLan >= SO_LAN_SAI_TOI_DA) {
      capNhat.khoaToi = new Date(Date.now() + THOI_GIAN_KHOA_PHUT * 60_000);
      capNhat.soLanDangNhapSai = 0;
    }
    await this.model.updateOne({ _id: nd._id }, capNhat).exec();
  }

  async ghiNhanDangNhapThanhCong(id: string) {
    await this.model
      .updateOne({ _id: id }, { lanDangNhapCuoi: new Date(), soLanDangNhapSai: 0, khoaToi: null })
      .exec();
  }

  async doiMatKhauApp(id: string, matKhauMoi: string): Promise<void> {
    const matKhauBam = await bcrypt.hash(matKhauMoi, BCRYPT_ROUNDS);
    await this.model.updateOne({ _id: id }, { matKhauBam }).exec();
  }

  /** Xoá vĩnh viễn — Apple 5.1.1v yêu cầu xoá NGAY, không phải khoá mềm. */
  async xoaVinhVien(id: string): Promise<void> {
    await this.model.deleteOne({ _id: id }).exec();
  }

  async luuPushToken(id: string, expoPushToken: string): Promise<void> {
    await this.model.updateOne({ _id: id }, { expoPushToken }).exec();
  }

  /** Người dùng có bật thông báo và đang hoạt động — dùng cho tác vụ gửi nhắc nhở hằng ngày. */
  danhSachCoPushToken() {
    return this.model.find({ expoPushToken: { $ne: '' }, dangHoatDong: true }).exec();
  }

  async danhSach(loc: { email?: string; trang?: number; moiTrang?: number }) {
    const dieuKien: FilterQuery<NguoiDungDocument> = {};
    if (loc.email) dieuKien.email = { $regex: loc.email, $options: 'i' };

    const trang = loc.trang ?? 1;
    const moiTrang = Math.min(loc.moiTrang ?? 50, 200);

    const [muc, tong] = await Promise.all([
      this.model
        .find(dieuKien)
        .sort({ createdAt: -1 })
        .skip((trang - 1) * moiTrang)
        .limit(moiTrang)
        .exec(),
      this.model.countDocuments(dieuKien),
    ]);

    return { muc, tong, trang, moiTrang, soTrang: Math.ceil(tong / moiTrang) };
  }

  async chiTiet(id: string) {
    const nd = await this.model.findById(id).exec();
    if (!nd) throw new NotFoundException('Không tìm thấy người dùng.');
    return nd;
  }

  async khoa(id: string, du_lieu: KhoaNguoiDungDto, nguoiDung: AuthenticatedUser) {
    const nd = await this.model
      .findByIdAndUpdate(id, { $set: { dangHoatDong: false, lyDoKhoa: du_lieu.lyDo ?? '' } }, { new: true })
      .exec();
    if (!nd) throw new NotFoundException('Không tìm thấy người dùng.');

    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'khoá người dùng',
      doiTuong: 'nguoi-dung',
      maDoiTuong: id,
      sauKhi: { dangHoatDong: false, lyDoKhoa: du_lieu.lyDo ?? '' },
    });
    return nd;
  }

  async kichHoat(id: string, nguoiDung: AuthenticatedUser) {
    const nd = await this.model
      .findByIdAndUpdate(id, { $set: { dangHoatDong: true, lyDoKhoa: '' } }, { new: true })
      .exec();
    if (!nd) throw new NotFoundException('Không tìm thấy người dùng.');

    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'kích hoạt lại người dùng',
      doiTuong: 'nguoi-dung',
      maDoiTuong: id,
      sauKhi: { dangHoatDong: true },
    });
    return nd;
  }
}
