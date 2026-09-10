import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MucGioCho, MucGioChoDocument } from './schemas/muc-gio-cho.schema';
import { ThemVaoGioDto } from './dto/them-vao-gio.dto';
import { VuonService } from '../vuon/vuon.service';
import { SanPhamService } from '../san-pham/san-pham.service';
import { NhomSanPham } from '../san-pham/schemas/san-pham.schema';
import type { LoaiViec } from 'src/common/constants/cay-trong.const';

/** Việc nào cần mua vật tư gì — tưới/phun sương không cần gợi ý mua thêm. */
const NHOM_THEO_LOAI_VIEC: Partial<Record<LoaiViec, NhomSanPham>> = {
  'bón phân': NhomSanPham.Phan,
  'thay đất': NhomSanPham.Dat,
};

const SO_NGAY_SAP_TOI = 7;

export interface GoiYGioCho {
  sanPhamId: string;
  ten: string;
  gia: number;
  lyDo: string;
}

@Injectable()
export class GioChoChamSocService {
  constructor(
    @InjectModel(MucGioCho.name) private readonly model: Model<MucGioChoDocument>,
    private readonly vuonService: VuonService,
    private readonly sanPhamService: SanPhamService,
  ) {}

  danhSach(nguoiDungId: string) {
    return this.model
      .find({ nguoiDungId: new Types.ObjectId(nguoiDungId) })
      .sort({ createdAt: -1 })
      .populate('sanPhamId', 'ten gia hinhAnh')
      .exec();
  }

  /**
   * Gợi ý vật tư dựa trên việc chăm sóc sắp tới trong `SO_NGAY_SAP_TOI` ngày
   * — CHƯA lưu vào giỏ, người dùng tự bấm thêm nếu muốn.
   */
  async goiY(nguoiDungId: string): Promise<GoiYGioCho[]> {
    const viecList = await this.vuonService.danhSachViec(nguoiDungId);
    const hanChot = Date.now() + SO_NGAY_SAP_TOI * 24 * 60 * 60 * 1000;

    const goiY: GoiYGioCho[] = [];
    for (const viec of viecList) {
      const nhom = NHOM_THEO_LOAI_VIEC[viec.loai as LoaiViec];
      if (!nhom) continue;
      if (new Date(viec.hanKeTiep).getTime() > hanChot) continue;

      const sanPhamList = await this.sanPhamService.theoNhomDangBan(nhom);
      const cayLienQuan = viec.cayCuaToiId as unknown as { tenGoi?: string } | null;
      for (const sp of sanPhamList) {
        goiY.push({
          sanPhamId: String(sp._id),
          ten: sp.ten,
          gia: sp.gia,
          lyDo: `${cayLienQuan?.tenGoi ?? 'Một cây trong vườn'} cần "${viec.loai}" trong vòng ${SO_NGAY_SAP_TOI} ngày`,
        });
      }
    }
    return goiY;
  }

  async themVaoGio(nguoiDungId: string, dto: ThemVaoGioDto) {
    return this.model.create({
      nguoiDungId: new Types.ObjectId(nguoiDungId),
      sanPhamId: new Types.ObjectId(dto.sanPhamId),
      lyDo: dto.lyDo,
      soLuong: dto.soLuong ?? 1,
    });
  }

  async danhDauDaMua(nguoiDungId: string, id: string) {
    const muc = await this.model
      .findOneAndUpdate(
        { _id: id, nguoiDungId: new Types.ObjectId(nguoiDungId) },
        { $set: { daMua: true } },
        { new: true },
      )
      .exec();
    if (!muc) throw new NotFoundException('Không tìm thấy mục này trong giỏ.');
    return muc;
  }

  async xoa(nguoiDungId: string, id: string) {
    const ketQua = await this.model
      .deleteOne({ _id: id, nguoiDungId: new Types.ObjectId(nguoiDungId) })
      .exec();
    if (ketQua.deletedCount === 0) throw new NotFoundException('Không tìm thấy mục này trong giỏ.');
    return { thanhCong: true };
  }
}
