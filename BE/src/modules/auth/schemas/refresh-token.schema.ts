import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

/**
 * Lưu BĂM của refresh token, không lưu token gốc.
 * Rò rỉ cơ sở dữ liệu không đồng nghĩa với việc chiếm được phiên đăng nhập.
 */
@Schema({ collection: 'refresh_tokens', timestamps: true })
export class RefreshToken {
  @Prop({ type: Types.ObjectId, ref: 'AdminUser', required: true, index: true })
  adminUserId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  tokenBam!: string;

  @Prop({ required: true })
  hetHanLuc!: Date;

  @Prop({ type: Date, default: null })
  thuHoiLuc!: Date | null;

  @Prop({ default: '' })
  thietBi!: string;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

// MongoDB tự dọn token hết hạn, không cần cron.
RefreshTokenSchema.index({ hetHanLuc: 1 }, { expireAfterSeconds: 0 });
