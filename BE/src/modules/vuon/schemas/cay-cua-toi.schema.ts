import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Mien, NoiDat } from 'src/common/constants/cay-trong.const';

export type CayCuaToiDocument = HydratedDocument<CayCuaToi>;

/**
 * Một cây trong vườn của một người dùng cụ thể — KHÁC `plants` (danh mục
 * loài cây dùng chung). `mien` + `noiDat` là "ngôi cảnh" (NgoiCanh) truyền
 * vào `sinhLichChamSoc()` để tính lại chu kỳ tưới thực tế.
 */
@Schema({ collection: 'user_plants', timestamps: true })
export class CayCuaToi {
  @Prop({ type: Types.ObjectId, required: true, ref: 'NguoiDung', index: true })
  nguoiDungId!: Types.ObjectId;

  @Prop({ required: true, lowercase: true, trim: true, index: true })
  maCay!: string;

  @Prop({ trim: true, default: '' })
  tenGoi!: string;

  @Prop({ required: true })
  mien!: Mien;

  @Prop({ required: true })
  noiDat!: NoiDat;

  @Prop({ required: true })
  ngayThem!: Date;
}

export const CayCuaToiSchema = SchemaFactory.createForClass(CayCuaToi);
