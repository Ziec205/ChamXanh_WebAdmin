import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum TrangThaiDonHang {
  ChoXacNhan = 'cho-xac-nhan',
  DangGiao = 'dang-giao',
  HoanThanh = 'hoan-thanh',
  DaHuy = 'da-huy',
}

export enum PhuongThucThanhToan {
  Momo = 'momo',
  Cod = 'cod',
  ChuyenKhoan = 'chuyen-khoan',
}

@Schema({ _id: false })
export class DongDonHang {
  @Prop({ type: Types.ObjectId, ref: 'SanPham', required: true })
  sanPhamId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  tenSanPham!: string;

  @Prop({ required: true, min: 0 })
  gia!: number;

  @Prop({ required: true, min: 1 })
  soLuong!: number;
}
export const DongDonHangSchema = SchemaFactory.createForClass(DongDonHang);

/** Chụp lại địa chỉ tại thời điểm đặt — đổi/xoá địa chỉ đã lưu sau đó không ảnh hưởng đơn cũ. */
@Schema({ _id: false })
export class DiaChiGiaoHang {
  @Prop({ required: true, trim: true })
  hoTen!: string;

  @Prop({ required: true, trim: true })
  soDienThoai!: string;

  @Prop({ required: true, trim: true })
  diaChiChiTiet!: string;

  @Prop({ trim: true, default: '' })
  phuongXa!: string;

  @Prop({ trim: true, default: '' })
  tinhThanh!: string;
}
export const DiaChiGiaoHangSchema = SchemaFactory.createForClass(DiaChiGiaoHang);

export type DonHangDocument = HydratedDocument<DonHang>;

/**
 * Đơn hàng Chợ Vật Tư. MoMo/COD dùng được trong app vì đây là hàng vật
 * lý, không phải nội dung số — xem "Nhật ký quyết định". Chỉ COD/chuyển
 * khoản hoạt động thật (GĐ 7) — MoMo chờ tài khoản merchant thật, enum
 * vẫn giữ để không phải đổi schema sau này.
 */
@Schema({ collection: 'orders', timestamps: true })
export class DonHang {
  @Prop({ type: Types.ObjectId, ref: 'NguoiDung', required: true, index: true })
  nguoiDungId!: Types.ObjectId;

  @Prop({ trim: true, default: '' })
  emailKhachHang!: string;

  @Prop({ trim: true, default: 'chamxanh' })
  vendorId!: string;

  @Prop({ type: [DongDonHangSchema], required: true, default: [] })
  danhSachHang!: DongDonHang[];

  @Prop({ required: true, min: 0 })
  tongTien!: number;

  @Prop({ required: true, enum: PhuongThucThanhToan })
  phuongThucThanhToan!: PhuongThucThanhToan;

  @Prop({ default: TrangThaiDonHang.ChoXacNhan, enum: TrangThaiDonHang, index: true })
  trangThai!: TrangThaiDonHang;

  @Prop({ type: DiaChiGiaoHangSchema, required: true })
  diaChiGiao!: DiaChiGiaoHang;
}

export const DonHangSchema = SchemaFactory.createForClass(DonHang);
