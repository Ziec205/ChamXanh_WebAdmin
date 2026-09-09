import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum SanThuongMai {
  Shopee = 'shopee',
  Lazada = 'lazada',
  Khac = 'khac',
}

export type LienKetTiepThiDocument = HydratedDocument<LienKetTiepThi>;

/**
 * Liên kết tiếp thị dẫn ra sàn ngoài — KHÔNG giữ hàng, khác hẳn `products`.
 * Trợ lý AI chỉ được chọn `tags`, backend tự ghép URL thật — xem quyết định
 * "LLM không được thấy URL affiliate" trong CLAUDE.md.
 */
@Schema({ collection: 'affiliate_links', timestamps: true })
export class LienKetTiepThi {
  @Prop({ required: true, trim: true, minlength: 1 })
  tieuDe!: string;

  @Prop({ trim: true, default: '' })
  moTa!: string;

  @Prop({ required: true, trim: true })
  url!: string;

  @Prop({ trim: true, default: '' })
  hinhAnh!: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ required: true, enum: SanThuongMai })
  san!: SanThuongMai;

  @Prop({ default: true, index: true })
  dangHienThi!: boolean;

  @Prop({ default: 0 })
  luotBam!: number;
}

export const LienKetTiepThiSchema = SchemaFactory.createForClass(LienKetTiepThi);
