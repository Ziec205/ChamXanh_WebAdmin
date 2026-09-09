import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MUC_SANG, type MucSang } from 'src/common/constants/cay-trong.const';

export type HoSoNguoiDungDocument = HydratedDocument<HoSoNguoiDung>;

/**
 * Kết quả khảo sát của một người dùng.
 *
 * Lưu cả câu trả lời thô lẫn đặc tính đã suy ra: câu trả lời thô để sau này
 * đổi công thức vẫn tính lại được, đặc tính suy ra để khỏi tính lại mỗi lần gợi ý.
 */
@Schema({ collection: 'user_profiles', timestamps: true })
export class HoSoNguoiDung {
  @Prop({ type: Types.ObjectId, required: true, unique: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Object, required: true })
  cauTraLoi!: Record<string, unknown>;

  @Prop({ required: true, enum: MUC_SANG })
  anhSangCoSan!: MucSang;

  @Prop({ required: true })
  coThuNuoi!: boolean;

  @Prop({ type: Date, default: Date.now })
  hoanThanhLuc!: Date;
}

export const HoSoNguoiDungSchema = SchemaFactory.createForClass(HoSoNguoiDung);
