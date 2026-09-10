import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DiaChiDocument = HydratedDocument<DiaChi>;

/** Địa chỉ giao hàng đã lưu của người dùng app — dùng lại khi đặt đơn ở Chợ Vật Tư. */
@Schema({ collection: 'addresses', timestamps: true })
export class DiaChi {
  @Prop({ type: Types.ObjectId, ref: 'NguoiDung', required: true, index: true })
  nguoiDungId!: Types.ObjectId;

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

  @Prop({ default: false })
  macDinh!: boolean;
}

export const DiaChiSchema = SchemaFactory.createForClass(DiaChi);
