import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MucGioChoDocument = HydratedDocument<MucGioCho>;

/**
 * Giỏ Chờ Chăm Sóc — "sản phẩm lưu sẵn cho nhu cầu sắp tới của một cây"
 * (xem Document/dac-ta-cham-xanh.html). KHÁC giỏ hàng Chợ Vật Tư thật
 * (`carts`, thuộc GĐ 7, chưa dựng) — đây chỉ là danh sách ghi nhớ, chưa
 * phải luồng thanh toán.
 */
@Schema({ collection: 'care_basket', timestamps: true })
export class MucGioCho {
  @Prop({ type: Types.ObjectId, required: true, ref: 'NguoiDung', index: true })
  nguoiDungId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'SanPham' })
  sanPhamId!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  lyDo!: string;

  @Prop({ default: 1, min: 1 })
  soLuong!: number;

  @Prop({ default: false })
  daMua!: boolean;
}

export const MucGioChoSchema = SchemaFactory.createForClass(MucGioCho);
