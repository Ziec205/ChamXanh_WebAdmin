import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { DonHang, DonHangDocument, TrangThaiDonHang } from './schemas/don-hang.schema';
import { CapNhatTrangThaiDonHangDto } from './dto/cap-nhat-trang-thai.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

/** Chuyển trạng thái hợp lệ — không cho nhảy cóc hay quay lui sau khi đã hoàn thành/huỷ. */
const CHUYEN_HOP_LE: Record<TrangThaiDonHang, TrangThaiDonHang[]> = {
  [TrangThaiDonHang.ChoXacNhan]: [TrangThaiDonHang.DangGiao, TrangThaiDonHang.DaHuy],
  [TrangThaiDonHang.DangGiao]: [TrangThaiDonHang.HoanThanh, TrangThaiDonHang.DaHuy],
  [TrangThaiDonHang.HoanThanh]: [],
  [TrangThaiDonHang.DaHuy]: [],
};

@Injectable()
export class DonHangService {
  constructor(
    @InjectModel(DonHang.name) private readonly model: Model<DonHangDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  danhSach(loc: { trangThai?: TrangThaiDonHang }) {
    const dieuKien: FilterQuery<DonHangDocument> = {};
    if (loc.trangThai) dieuKien.trangThai = loc.trangThai;
    return this.model.find(dieuKien).sort({ createdAt: -1 }).exec();
  }

  async chiTiet(id: string) {
    const dh = await this.model.findById(id).exec();
    if (!dh) throw new NotFoundException('Không tìm thấy đơn hàng.');
    return dh;
  }

  async capNhatTrangThai(id: string, du_lieu: CapNhatTrangThaiDonHangDto, nguoiDung: AuthenticatedUser) {
    const dh = await this.model.findById(id).exec();
    if (!dh) throw new NotFoundException('Không tìm thấy đơn hàng.');

    const chuyenDuoc = CHUYEN_HOP_LE[dh.trangThai];
    if (!chuyenDuoc.includes(du_lieu.trangThai)) {
      throw new BadRequestException(
        `Không thể chuyển đơn hàng từ trạng thái "${dh.trangThai}" sang "${du_lieu.trangThai}".`,
      );
    }

    const truoc = dh.trangThai;
    dh.trangThai = du_lieu.trangThai;
    await dh.save();

    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'cập nhật trạng thái đơn hàng',
      doiTuong: 'don-hang',
      maDoiTuong: id,
      truocKhi: { trangThai: truoc },
      sauKhi: { trangThai: du_lieu.trangThai },
    });

    return dh;
  }
}
