import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CauHinh, CauHinhDocument } from './schemas/cau-hinh.schema';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import type { TrongSo } from '../goi-y/cham-diem';
import type { CapNhatCauHinhDto } from './dto/cap-nhat-cau-hinh.dto';

const KHOA = 'mac-dinh';
const THOI_GIAN_NHO_MS = 30_000;

@Injectable()
export class CauHinhService {
  /**
   * Cấu hình được đọc ở gần như mọi request nhưng gần như không bao giờ đổi,
   * nên giữ tạm trong bộ nhớ 30 giây thay vì truy vấn mỗi lần.
   * Sửa cấu hình thì xoá bộ nhớ tạm ngay, không phải chờ hết hạn.
   */
  private boNhoTam: { duLieu: CauHinhDocument; hetHan: number } | null = null;

  constructor(
    @InjectModel(CauHinh.name) private readonly model: Model<CauHinhDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  /** Đọc cấu hình, tự tạo bản mặc định nếu chưa có. */
  async lay(): Promise<CauHinhDocument> {
    if (this.boNhoTam && this.boNhoTam.hetHan > Date.now()) {
      return this.boNhoTam.duLieu;
    }

    const duLieu = await this.model
      .findOneAndUpdate(
        { khoa: KHOA },
        { $setOnInsert: { khoa: KHOA } },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    this.boNhoTam = { duLieu, hetHan: Date.now() + THOI_GIAN_NHO_MS };
    return duLieu;
  }

  /** Trọng số cho bộ chấm điểm gợi ý. */
  async trongSoGoiY(): Promise<TrongSo> {
    const c = await this.lay();
    return {
      anhSang: c.trongSoGoiY.anhSang,
      thoiGian: c.trongSoGoiY.thoiGian,
      kinhNghiem: c.trongSoGoiY.kinhNghiem,
      dienTich: c.trongSoGoiY.dienTich,
      mucDich: c.trongSoGoiY.mucDich,
      phongThuy: c.trongSoGoiY.phongThuy,
    };
  }

  async coBat(tenTinhNang: string): Promise<boolean> {
    const c = await this.lay();
    return c.congTacTinhNang?.[tenTinhNang] === true;
  }

  /**
   * Cập nhật cấu hình. Mọi thay đổi đều được ghi vào nhật ký kèm giá trị
   * trước và sau — đây là những con số ảnh hưởng trực tiếp tới chi phí và
   * doanh thu, nên phải truy được ai đổi.
   */
  async capNhat(
    thayDoi: CapNhatCauHinhDto,
    nguoiDung: AuthenticatedUser,
  ): Promise<CauHinhDocument> {
    const truoc = await this.lay();
    const truocKhi = this.chonTruongLienQuan(truoc.toObject() as unknown as Record<string, unknown>, thayDoi);

    // Khoá là định danh của bản ghi duy nhất, không cho đổi.
    const { khoa: _bo, ...duocPhepDoi } = thayDoi as Record<string, unknown>;

    const sau = await this.model
      .findOneAndUpdate({ khoa: KHOA }, { $set: duocPhepDoi }, { new: true })
      .exec();

    this.boNhoTam = null;

    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'cập nhật cấu hình hệ thống',
      doiTuong: 'cau-hinh',
      maDoiTuong: KHOA,
      truocKhi,
      sauKhi: this.chonTruongLienQuan(sau!.toObject() as unknown as Record<string, unknown>, thayDoi),
    });

    return sau!;
  }

  /** Chỉ giữ lại những trường thật sự nằm trong lần sửa này, không chép cả document. */
  private chonTruongLienQuan(
    day_du: Record<string, unknown>,
    thayDoi: CapNhatCauHinhDto,
  ): Record<string, unknown> {
    const ketQua: Record<string, unknown> = {};
    for (const khoa of Object.keys(thayDoi)) {
      ketQua[khoa] = day_du[khoa];
    }
    return ketQua;
  }
}
