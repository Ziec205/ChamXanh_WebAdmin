import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { NhatKy, NhatKyDocument } from './schemas/nhat-ky.schema';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

export interface ThamSoGhi {
  nguoiDung: AuthenticatedUser;
  hanhDong: string;
  doiTuong: string;
  maDoiTuong?: string;
  truocKhi?: Record<string, unknown> | null;
  sauKhi?: Record<string, unknown> | null;
}

@Injectable()
export class NhatKyService {
  private readonly logger = new Logger(NhatKyService.name);

  constructor(@InjectModel(NhatKy.name) private readonly model: Model<NhatKyDocument>) {}

  /**
   * Ghi một thao tác.
   *
   * Không bao giờ ném lỗi ra ngoài: hỏng nhật ký không được phép làm hỏng
   * chính thao tác nghiệp vụ mà nó đang ghi lại.
   */
  async ghi(thamSo: ThamSoGhi): Promise<void> {
    try {
      await this.model.create({
        adminUserId: new Types.ObjectId(thamSo.nguoiDung.id),
        email: thamSo.nguoiDung.email,
        vaiTro: thamSo.nguoiDung.role,
        hanhDong: thamSo.hanhDong,
        doiTuong: thamSo.doiTuong,
        maDoiTuong: thamSo.maDoiTuong ?? '',
        truocKhi: thamSo.truocKhi ?? null,
        sauKhi: thamSo.sauKhi ?? null,
      });
    } catch (e) {
      this.logger.error(`Không ghi được nhật ký cho thao tác "${thamSo.hanhDong}"`, e as Error);
    }
  }

  async danhSach(loc: { doiTuong?: string; email?: string; trang?: number; moiTrang?: number }) {
    const dieuKien: FilterQuery<NhatKyDocument> = {};
    if (loc.doiTuong) dieuKien.doiTuong = loc.doiTuong;
    if (loc.email) dieuKien.email = loc.email;

    const trang = loc.trang ?? 1;
    const moiTrang = Math.min(loc.moiTrang ?? 50, 200);

    const [muc, tong] = await Promise.all([
      this.model
        .find(dieuKien)
        .sort({ thoiDiem: -1 })
        .skip((trang - 1) * moiTrang)
        .limit(moiTrang)
        .lean()
        .exec(),
      this.model.countDocuments(dieuKien),
    ]);

    return { muc, tong, trang, moiTrang, soTrang: Math.ceil(tong / moiTrang) };
  }
}
