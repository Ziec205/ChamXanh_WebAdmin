import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SanPham, SanPhamDocument } from './schemas/san-pham.schema';
import { CreateSanPhamDto } from './dto/create-san-pham.dto';
import { UpdateSanPhamDto } from './dto/update-san-pham.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@Injectable()
export class SanPhamService {
  constructor(
    @InjectModel(SanPham.name) private readonly model: Model<SanPhamDocument>,
    private readonly nhatKy: NhatKyService,
  ) {}

  danhSach() {
    return this.model.find().sort({ createdAt: -1 }).exec();
  }

  /** Sản phẩm đang bán thuộc một nhóm — dùng để gợi ý vật tư cho Giỏ Chờ Chăm Sóc. */
  theoNhomDangBan(nhom: string) {
    return this.model.find({ nhom, dangBan: true }).limit(5).exec();
  }

  /**
   * Trừ tồn kho nguyên tử — chỉ thành công nếu còn đủ hàng, tránh bán âm
   * khi nhiều đơn đặt cùng lúc. Dùng khi tạo đơn hàng ở Chợ Vật Tư.
   */
  async giamTonKho(id: string, soLuong: number): Promise<boolean> {
    const ketQua = await this.model
      .updateOne({ _id: id, dangBan: true, tonKho: { $gte: soLuong } }, { $inc: { tonKho: -soLuong } })
      .exec();
    return ketQua.modifiedCount > 0;
  }

  /** Hoàn lại tồn kho — dùng khi một đơn hàng tạo dở bị huỷ giữa chừng. */
  async hoanTonKho(id: string, soLuong: number): Promise<void> {
    await this.model.updateOne({ _id: id }, { $inc: { tonKho: soLuong } }).exec();
  }

  async chiTiet(id: string) {
    const muc = await this.model.findById(id).exec();
    if (!muc) throw new NotFoundException('Không tìm thấy liên kết tiếp thị.');
    return muc;
  }

  async taoMoi(du_lieu: CreateSanPhamDto, nguoiDung: AuthenticatedUser) {
    const muc = await this.model.create(du_lieu);
    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'thêm sản phẩm',
      doiTuong: 'san-pham',
      maDoiTuong: String(muc._id),
      sauKhi: du_lieu as unknown as Record<string, unknown>,
    });
    return muc;
  }

  async capNhat(id: string, du_lieu: UpdateSanPhamDto, nguoiDung: AuthenticatedUser) {
    const truoc = await this.model.findById(id).lean().exec();
    if (!truoc) throw new NotFoundException('Không tìm thấy liên kết tiếp thị.');

    const muc = await this.model.findByIdAndUpdate(id, { $set: du_lieu }, { new: true }).exec();

    const truocKhi: Record<string, unknown> = {};
    const sauKhi: Record<string, unknown> = {};
    for (const truong of Object.keys(du_lieu)) {
      const cu = (truoc as Record<string, unknown>)[truong];
      const moi = (du_lieu as Record<string, unknown>)[truong];
      if (JSON.stringify(cu) !== JSON.stringify(moi)) {
        truocKhi[truong] = cu;
        sauKhi[truong] = moi;
      }
    }

    if (Object.keys(sauKhi).length > 0) {
      await this.nhatKy.ghi({
        nguoiDung,
        hanhDong: 'sửa sản phẩm',
        doiTuong: 'san-pham',
        maDoiTuong: id,
        truocKhi,
        sauKhi,
      });
    }

    return muc!;
  }

  async xoa(id: string, nguoiDung: AuthenticatedUser) {
    const muc = await this.model.findByIdAndDelete(id).exec();
    if (!muc) throw new NotFoundException('Không tìm thấy liên kết tiếp thị.');
    await this.nhatKy.ghi({
      nguoiDung,
      hanhDong: 'xoá sản phẩm',
      doiTuong: 'san-pham',
      maDoiTuong: id,
      truocKhi: muc.toObject() as unknown as Record<string, unknown>,
    });
    return { thanhCong: true };
  }
}
