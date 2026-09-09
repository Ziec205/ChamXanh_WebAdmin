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

export type DonHangDocument = HydratedDocument<DonHang>;

/**
 * Đơn hàng Chợ Vật Tư. MoMo/COD dùng được trong app vì đây là hàng vật
 * lý, không phải nội dung số — xem "Nhật ký quyết định". Chưa có luồng
 * đặt đơn thật từ app (GĐ 7); Admin hiện chỉ xem và cập nhật trạng thái.
 */
@Schema({ collection: 'orders', timestamps: true })
export class DonHang {
  @Prop({ trim: true, default: '' })
  emailKhachHang!: string;

  @Prop({ type: [DongDonHangSchema], required: true, default: [] })
  danhSachHang!: DongDonHang[];

  @Prop({ required: true, min: 0 })
  tongTien!: number;

  @Prop({ required: true, enum: PhuongThucThanhToan })
  phuongThucThanhToan!: PhuongThucThanhToan;

  @Prop({ default: TrangThaiDonHang.ChoXacNhan, enum: TrangThaiDonHang, index: true })
  trangThai!: TrangThaiDonHang;

  @Prop({ trim: true, default: '' })
  diaChiGiao!: string;
}

export const DonHangSchema = SchemaFactory.createForClass(DonHang);
