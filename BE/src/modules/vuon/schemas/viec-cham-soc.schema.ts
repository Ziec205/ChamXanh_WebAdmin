import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { LoaiViec } from 'src/common/constants/cay-trong.const';

export type ViecChamSocDocument = HydratedDocument<ViecChamSoc>;

/**
 * Một dòng lịch chăm sóc — bốn loại việc (tưới, bón phân, phun sương, thay
 * đất) là bốn document riêng, không gộp. Sinh ra bởi hàm thuần
 * `sinhLichChamSoc()` lúc thêm cây, rồi tự dời hạn mỗi lần hoàn thành.
 */
@Schema({ collection: 'care_tasks', timestamps: true })
export class ViecChamSoc {
  @Prop({ type: Types.ObjectId, required: true, ref: 'NguoiDung', index: true })
  nguoiDungId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: 'CayCuaToi', index: true })
  cayCuaToiId!: Types.ObjectId;

  @Prop({ required: true })
  loai!: LoaiViec;

  @Prop({ required: true, min: 1 })
  chuKyNgay!: number;

  @Prop({ required: true, index: true })
  hanKeTiep!: Date;

  @Prop({ required: true, trim: true })
  huongDan!: string;

  @Prop({ type: Date, default: null })
  hoanThanhLanCuoi!: Date | null;
}

export const ViecChamSocSchema = SchemaFactory.createForClass(ViecChamSoc);
