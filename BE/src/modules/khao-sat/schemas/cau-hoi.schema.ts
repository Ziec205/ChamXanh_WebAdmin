import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class DapAn {
  @Prop({ required: true })
  giaTri!: string;

  @Prop({ required: true, trim: true })
  nhan!: string;

  @Prop({ trim: true, default: '' })
  moTa!: string;
}

export type CauHoiDocument = HydratedDocument<CauHoi>;

@Schema({ collection: 'survey_questions', timestamps: true })
export class CauHoi {
  /**
   * Khoá kỹ thuật, KHÔNG được đổi sau khi đã có người trả lời.
   * Thuật toán gợi ý đọc câu trả lời theo đúng khoá này.
   */
  @Prop({ required: true, unique: true, index: true })
  khoa!: string;

  @Prop({ required: true })
  thuTu!: number;

  @Prop({ required: true, trim: true })
  cauHoi!: string;

  @Prop({ trim: true, default: '' })
  moTa!: string;

  @Prop({ default: false })
  nhieuLuaChon!: boolean;

  @Prop({ default: true })
  batBuoc!: boolean;

  @Prop({ type: [DapAn], default: [] })
  dapAn!: DapAn[];

  @Prop({ default: true })
  dangHienThi!: boolean;
}

export const CauHoiSchema = SchemaFactory.createForClass(CauHoi);
