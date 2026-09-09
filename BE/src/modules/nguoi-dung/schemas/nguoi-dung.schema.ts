import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Hồ sơ tối thiểu của người dùng app, đủ để Admin tra cứu và khoá/kích
 * hoạt. Tài khoản người dùng KHÔNG được tạo qua Web Admin — chỉ tự đăng
 * ký trong app (GĐ 5). Schema này sẽ mở rộng khi GĐ 5 dựng xong luồng
 * đăng ký thật; hiện chỉ đủ trường phục vụ tra cứu/kiểm duyệt.
 */
export type NguoiDungDocument = HydratedDocument<NguoiDung>;

@Schema({ collection: 'users', timestamps: true })
export class NguoiDung {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ trim: true, default: '' })
  hoTen!: string;

  @Prop({ trim: true, default: '' })
  anhDaiDien!: string;

  @Prop({ default: true, index: true })
  dangHoatDong!: boolean;

  @Prop({ trim: true, default: '' })
  lyDoKhoa!: string;
}

export const NguoiDungSchema = SchemaFactory.createForClass(NguoiDung);
