import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { DiaChiGiaoHang, DonHang, DonHangDocument, TrangThaiDonHang } from './schemas/don-hang.schema';
import { CapNhatTrangThaiDonHangDto } from './dto/cap-nhat-trang-thai.dto';
import { TaoDonHangDto } from './dto/tao-don-hang.dto';
import { NhatKyService } from '../nhat-ky/nhat-ky.service';
import { GioHangService } from '../gio-hang/gio-hang.service';
import { SanPhamService } from '../san-pham/san-pham.service';
import { DiaChiService } from '../dia-chi/dia-chi.service';
import { NguoiDungService } from '../nguoi-dung/nguoi-dung.service';
import type { AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import type { SanPhamDocument } from '../san-pham/schemas/san-pham.schema';

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
    private readonly gioHangService: GioHangService,
    private readonly sanPhamService: SanPhamService,
    private readonly diaChiService: DiaChiService,
    private readonly nguoiDungService: NguoiDungService,
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

  danhSachCuaToi(nguoiDungId: string) {
    return this.model
      .find({ nguoiDungId: new Types.ObjectId(nguoiDungId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async chiTietCuaToi(nguoiDungId: string, id: string) {
    const dh = await this.model.findOne({ _id: id, nguoiDungId: new Types.ObjectId(nguoiDungId) }).exec();
    if (!dh) throw new NotFoundException('Không tìm thấy đơn hàng.');
    return dh;
  }

  /**
   * Đặt đơn từ giỏ hàng hiện có: tự tính lại tiền từ giá server (không tin
   * giá phía client), trừ tồn kho nguyên tử từng dòng — dòng nào hết hàng
   * thì báo lỗi và hoàn lại tồn kho của các dòng đã trừ trước đó.
   */
  async taoDonHangTuGioHang(nguoiDungId: string, dto: TaoDonHangDto) {
    const gioHang = await this.gioHangService.cuaToi(nguoiDungId);
    if (gioHang.mucList.length === 0) {
      throw new BadRequestException('Giỏ hàng đang trống.');
    }

    const diaChiGiao = await this.xacDinhDiaChiGiao(nguoiDungId, dto);

    const danhSachHang: DonHang['danhSachHang'] = [];
    const daTru: { id: string; soLuong: number }[] = [];
    try {
      for (const muc of gioHang.mucList) {
        const sp = muc.sanPhamId as unknown as SanPhamDocument;
        if (!sp || !sp.dangBan) {
          throw new BadRequestException(`Sản phẩm "${sp?.ten ?? ''}" hiện không còn bán.`);
        }
        const idSp = String(sp._id);
        const ok = await this.sanPhamService.giamTonKho(idSp, muc.soLuong);
        if (!ok) {
          throw new BadRequestException(`Sản phẩm "${sp.ten}" không đủ tồn kho (còn ${sp.tonKho}).`);
        }
        daTru.push({ id: idSp, soLuong: muc.soLuong });
        danhSachHang.push({ sanPhamId: sp._id, tenSanPham: sp.ten, gia: sp.gia, soLuong: muc.soLuong });
      }
    } catch (loi) {
      for (const dong of daTru) {
        await this.sanPhamService.hoanTonKho(dong.id, dong.soLuong);
      }
      throw loi;
    }

    const tongTien = danhSachHang.reduce((tong, dong) => tong + dong.gia * dong.soLuong, 0);
    const nguoiDung = await this.nguoiDungService.chiTiet(nguoiDungId);

    const donHang = await this.model.create({
      nguoiDungId: new Types.ObjectId(nguoiDungId),
      emailKhachHang: nguoiDung.email,
      danhSachHang,
      tongTien,
      phuongThucThanhToan: dto.phuongThucThanhToan,
      diaChiGiao,
    });

    await this.gioHangService.lamRong(nguoiDungId);
    return donHang;
  }

  private async xacDinhDiaChiGiao(nguoiDungId: string, dto: TaoDonHangDto): Promise<DiaChiGiaoHang> {
    if (dto.diaChiId) {
      const dc = await this.diaChiService.chiTiet(nguoiDungId, dto.diaChiId);
      return {
        hoTen: dc.hoTen,
        soDienThoai: dc.soDienThoai,
        diaChiChiTiet: dc.diaChiChiTiet,
        phuongXa: dc.phuongXa,
        tinhThanh: dc.tinhThanh,
      };
    }
    if (dto.diaChiMoi) {
      const { hoTen, soDienThoai, diaChiChiTiet, phuongXa, tinhThanh } = dto.diaChiMoi;
      return { hoTen, soDienThoai, diaChiChiTiet, phuongXa: phuongXa ?? '', tinhThanh: tinhThanh ?? '' };
    }
    throw new BadRequestException('Cần chọn một địa chỉ đã lưu hoặc nhập địa chỉ giao hàng mới.');
  }
}
