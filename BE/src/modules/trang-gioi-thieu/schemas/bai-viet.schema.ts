import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BaiVietDocument = HydratedDocument<BaiViet>;

/**
 * Nội dung web giới thiệu công khai (`articles` + `landing_pages` gộp
 * chung một collection quản trị — cả hai đều là bài viết tĩnh do Content
 * biên tập). `duongDan` là slug hiển thị trên web giới thiệu.
 */
@Schema({ collection: 'articles', timestamps: true })
export class BaiViet {
  @Prop({ required: true, trim: true, minlength: 1 })
  tieuDe!: string;

  @Prop({ required: true, unique: true, trim: true, match: /^[a-z0-9-]+$/ })
  duongDan!: string;

  @Prop({ trim: true, default: '' })
  tomTat!: string;

  @Prop({ required: true })
  noiDung!: string;

  @Prop({ trim: true, default: '' })
  hinhAnh!: string;

  @Prop({ default: false, index: true })
  daXuatBan!: boolean;
}

export const BaiVietSchema = SchemaFactory.createForClass(BaiViet);
