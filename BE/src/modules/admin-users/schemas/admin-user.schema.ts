import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/**
 * Ba vai theo đặc tả:
 *  - admin   : toàn quyền, gồm cấu hình hệ thống, giá gói, hạn mức, quản lý tài khoản quản trị
 *  - content : nhập cây trồng, viết bài, fill nội dung landing page
 *  - support : xem và khoá tài khoản người dùng, duyệt hàng đợi kiểm duyệt cộng đồng
 */
export enum AdminRole {
  Admin = 'admin',
  Content = 'content',
  Support = 'support',
}

export type AdminUserDocument = HydratedDocument<AdminUser>;

@Schema({ collection: 'admin_users', timestamps: true })
export class AdminUser {
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  /** Luôn là chuỗi băm bcrypt. Không bao giờ trả về cho client — xem toJSON bên dưới. */
  @Prop({ required: true, select: false })
  matKhauBam!: string;

  @Prop({ required: true, trim: true })
  hoTen!: string;

  @Prop({ required: true, enum: AdminRole, default: AdminRole.Content, index: true })
  vaiTro!: AdminRole;

  @Prop({ default: true })
  dangHoatDong!: boolean;

  @Prop({ type: Date, default: null })
  lanDangNhapCuoi!: Date | null;

  /** Đếm số lần đăng nhập sai liên tiếp để khoá tạm thời. */
  @Prop({ default: 0 })
  soLanDangNhapSai!: number;

  @Prop({ type: Date, default: null })
  khoaToi!: Date | null;
}

export const AdminUserSchema = SchemaFactory.createForClass(AdminUser);

// Chặn rò rỉ mật khẩu băm qua bất kỳ đường serialize nào.
AdminUserSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.matKhauBam;
    delete ret.__v;
    return ret;
  },
});
