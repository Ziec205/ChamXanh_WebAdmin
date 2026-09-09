import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum LoaiDoiTuongBaoCao {
  Bai_viet = 'bai-viet',
  Binh_luan = 'binh-luan',
  Nguoi_dung = 'nguoi-dung',
}

export enum TrangThaiBaoCao {
  ChoXuLy = 'cho-xu-ly',
  DaXuLy = 'da-xu-ly',
  DaBoQua = 'da-bo-qua',
}

export type BaoCaoDocument = HydratedDocument<BaoCao>;

/**
 * Hàng đợi kiểm duyệt cộng đồng (Apple 1.2). Cộng đồng (đăng bài, bình
 * luận) thuộc GĐ 8 nên `maDoiTuong` hiện chỉ là chuỗi tham chiếu tự do,
 * chưa ràng buộc khoá ngoại tới `posts`/`comments`.
 */
@Schema({ collection: 'reports', timestamps: true })
export class BaoCao {
  @Prop({ required: true, enum: LoaiDoiTuongBaoCao })
  loaiDoiTuong!: LoaiDoiTuongBaoCao;

  @Prop({ required: true, trim: true })
  maDoiTuong!: string;

  @Prop({ type: Types.ObjectId, ref: 'NguoiDung' })
  nguoiBaoCaoId?: Types.ObjectId;

  @Prop({ trim: true, default: '' })
  emailNguoiBaoCao!: string;

  @Prop({ required: true, trim: true, minlength: 1 })
  lyDo!: string;

  @Prop({ default: TrangThaiBaoCao.ChoXuLy, enum: TrangThaiBaoCao, index: true })
  trangThai!: TrangThaiBaoCao;

  @Prop({ trim: true, default: '' })
  ghiChuXuLy!: string;
}

export const BaoCaoSchema = SchemaFactory.createForClass(BaoCao);
