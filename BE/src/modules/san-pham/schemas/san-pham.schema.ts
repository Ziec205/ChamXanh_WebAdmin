import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum NhomSanPham {
  Dat = 'dat',
  Phan = 'phan',
  Chau = 'chau',
  HatGiong = 'hat-giong',
  DungCu = 'dung-cu',
}

export type SanPhamDocument = HydratedDocument<SanPham>;

/**
 * Hàng của chính Chạm Xanh, có tồn kho — khác `affiliate_links` (dẫn ra
 * sàn ngoài, không giữ hàng). Gắn sẵn `vendorId` để sau này mở nhiều
 * người bán không phải chuyển đổi dữ liệu — xem "Nhật ký quyết định".
 * Mở bán bằng nhóm hàng không hỏng trước (đất, phân, chậu, hạt giống,
 * dụng cụ) — cây sống để sau.
 */
@Schema({ collection: 'products', timestamps: true })
export class SanPham {
  @Prop({ required: true, trim: true, minlength: 1 })
  ten!: string;

  @Prop({ trim: true, default: '' })
  moTa!: string;

  @Prop({ required: true, enum: NhomSanPham })
  nhom!: NhomSanPham;

  @Prop({ required: true, min: 0 })
  gia!: number;

  @Prop({ required: true, min: 0, default: 0 })
  tonKho!: number;

  @Prop({ type: [String], default: [] })
  hinhAnh!: string[];

  @Prop({ default: 'chamxanh', index: true })
  vendorId!: string;

  @Prop({ default: true, index: true })
  dangBan!: boolean;
}

export const SanPhamSchema = SchemaFactory.createForClass(SanPham);
