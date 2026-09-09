import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { NguoiDung, NguoiDungDocument } from './schemas/nguoi-dung.schema';
import { KhoaNguoiDungDto } from './dto/khoa-nguoi-dung.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class NguoiDungService {
  constructor(
    @InjectModel(NguoiDung.name) private readonly model: Model<NguoiDungDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

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
