import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Hồ sơ người dùng app (mobile), dùng chung cho hai phía:
 *  - Web Admin: tra cứu, khoá/kích hoạt (`dangHoatDong` + `lyDoKhoa`)
 *  - App: tự đăng ký/đăng nhập bằng email + mật khẩu (GĐ 5)
 * `khoaToi`/`soLanDangNhapSai` là khoá TẠM do đăng nhập sai nhiều lần,
 * khác với `dangHoatDong=false` là khoá VĨNH VIỄN do Admin xử lý kiểm duyệt.
 */
export type NguoiDungDocument = HydratedDocument<NguoiDung>;

@Schema({ collection: 'users', timestamps: true })
export class NguoiDung {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  /** Luôn là chuỗi băm bcrypt. Không bao giờ trả về cho client — xem toJSON bên dưới. */
  @Prop({ required: true, select: false })
  matKhauBam!: string;

  @Prop({ trim: true, default: '' })
  hoTen!: string;

  @Prop({ trim: true, default: '' })
  anhDaiDien!: string;

  @Prop({ default: true, index: true })
  dangHoatDong!: boolean;

  @Prop({ trim: true, default: '' })
  lyDoKhoa!: string;

  @Prop({ type: Date, default: null })
  lanDangNhapCuoi!: Date | null;

  /** Đếm số lần đăng nhập sai liên tiếp để khoá tạm thời. */
  @Prop({ default: 0 })
  soLanDangNhapSai!: number;

  @Prop({ type: Date, default: null })
  khoaToi!: Date | null;

  /** Token thiết bị của Expo Push — rỗng nghĩa là chưa cấp quyền/chưa đăng ký. */
  @Prop({ trim: true, default: '' })
  expoPushToken!: string;
}

export const NguoiDungSchema = SchemaFactory.createForClass(NguoiDung);

// Chặn rò rỉ mật khẩu băm qua bất kỳ đường serialize nào.
NguoiDungSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.matKhauBam;
    delete ret.__v;
    return ret;
  },
});
