import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LoaiViec } from 'src/common/constants/cay-trong.const';

@Schema({ _id: false })
export class BuocThucHien {
  @Prop({ required: true })
  thuTu!: number;

  @Prop({ required: true, trim: true })
  tieuDe!: string;

  @Prop({ trim: true, default: '' })
  moTa!: string;
}
export const BuocThucHienSchema = SchemaFactory.createForClass(BuocThucHien);

export type HuongDanChamSocDocument = HydratedDocument<HuongDanChamSoc>;

/**
 * Hướng dẫn thao tác từng bước cho MỘT loại việc (tưới, bón phân, phun
 * sương, thay đất) — dùng chung cho mọi cây, không phải riêng từng loài.
 * `loai` là khoá kỹ thuật, giống `khoa` ở khảo sát: không đổi được sau khi
 * tạo vì app tham chiếu theo giá trị này.
 */
@Schema({ collection: 'care_guides', timestamps: true })
export class HuongDanChamSoc {
  @Prop({ required: true, unique: true, index: true })
  loai!: LoaiViec;

  @Prop({ required: true, trim: true })
  tieuDe!: string;

  @Prop({ type: [BuocThucHienSchema], required: true, default: [] })
  cacBuoc!: BuocThucHien[];
}

export const HuongDanChamSocSchema = SchemaFactory.createForClass(HuongDanChamSoc);
