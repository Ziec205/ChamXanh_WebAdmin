import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AdminRole } from 'src/modules/admin-users/schemas/admin-user.schema';

export type NhatKyDocument = HydratedDocument<NhatKy>;

/**
 * Nhật ký thao tác của người quản trị.
 *
 * Có ba vai cùng làm việc trên cùng dữ liệu, nên phải trả lời được câu hỏi
 * "ai đổi trường này, lúc nào, từ giá trị gì sang giá trị gì".
 */
@Schema({ collection: 'audit_logs', timestamps: { createdAt: 'thoiDiem', updatedAt: false } })
export class NhatKy {
  @Prop({ type: Types.ObjectId, required: true, index: true })
  adminUserId!: Types.ObjectId;

  /** Chép lại email và vai tại thời điểm thao tác — tài khoản sau này có thể bị xoá hoặc đổi vai. */
  @Prop({ required: true })
  email!: string;

  @Prop({ required: true, enum: AdminRole })
  vaiTro!: AdminRole;

  @Prop({ required: true, index: true })
  hanhDong!: string;

  @Prop({ required: true, index: true })
  doiTuong!: string;

  @Prop({ default: '' })
  maDoiTuong!: string;

  /** Chỉ lưu những trường thật sự thay đổi, không chép cả document. */
  @Prop({ type: Object, default: null })
  truocKhi!: Record<string, unknown> | null;

  @Prop({ type: Object, default: null })
  sauKhi!: Record<string, unknown> | null;

  // Không khai index ở đây: index TTL bên dưới đã bao gồm việc đánh chỉ mục trường này.
  @Prop({ type: Date })
  thoiDiem!: Date;
}

export const NhatKySchema = SchemaFactory.createForClass(NhatKy);

// Giữ nhật ký một năm rồi tự dọn.
NhatKySchema.index({ thoiDiem: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
