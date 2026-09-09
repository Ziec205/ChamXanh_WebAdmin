import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RefreshTokenNguoiDungDocument = HydratedDocument<RefreshTokenNguoiDung>;

/**
 * Refresh token của người dùng app — collection RIÊNG với `refresh_tokens`
 * của Web Admin (khác không gian định danh, khác vòng đời phiên).
 */
@Schema({ collection: 'user_refresh_tokens', timestamps: true })
export class RefreshTokenNguoiDung {
  @Prop({ type: Types.ObjectId, required: true, ref: 'NguoiDung', index: true })
  nguoiDungId!: Types.ObjectId;

  @Prop({ required: true, unique: true, index: true })
  tokenBam!: string;

  @Prop({ required: true })
  hetHanLuc!: Date;

  @Prop({ type: Date, default: null })
  thuHoiLuc!: Date | null;

  @Prop({ trim: true, default: '' })
  thietBi!: string;
}

export const RefreshTokenNguoiDungSchema = SchemaFactory.createForClass(RefreshTokenNguoiDung);
