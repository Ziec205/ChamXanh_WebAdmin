import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
export class MucGioHang {
  @Prop({ type: Types.ObjectId, ref: 'SanPham', required: true })
  sanPhamId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  soLuong!: number;
}
export const MucGioHangSchema = SchemaFactory.createForClass(MucGioHang);

export type GioHangDocument = HydratedDocument<GioHang>;

/**
 * Giỏ hàng Chợ Vật Tư thật (`carts`) — KHÁC `care_basket` (Giỏ Chờ Chăm
 * Sóc, chỉ là danh sách ghi nhớ). Mỗi người dùng có đúng một giỏ.
 */
@Schema({ collection: 'carts', timestamps: true })
export class GioHang {
  @Prop({ type: Types.ObjectId, ref: 'NguoiDung', required: true, unique: true, index: true })
  nguoiDungId!: Types.ObjectId;

  @Prop({ type: [MucGioHangSchema], required: true, default: [] })
  mucList!: MucGioHang[];
}

export const GioHangSchema = SchemaFactory.createForClass(GioHang);
