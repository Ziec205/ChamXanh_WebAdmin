import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TRONG_SO_MAC_DINH } from 'src/modules/goi-y/cham-diem';

@Schema({ _id: false })
export class TrongSoGoiY {
  @Prop({ default: TRONG_SO_MAC_DINH.anhSang, min: 0, max: 100 })
  anhSang!: number;

  @Prop({ default: TRONG_SO_MAC_DINH.thoiGian, min: 0, max: 100 })
  thoiGian!: number;

  @Prop({ default: TRONG_SO_MAC_DINH.kinhNghiem, min: 0, max: 100 })
  kinhNghiem!: number;

  @Prop({ default: TRONG_SO_MAC_DINH.dienTich, min: 0, max: 100 })
  dienTich!: number;

  @Prop({ default: TRONG_SO_MAC_DINH.mucDich, min: 0, max: 100 })
  mucDich!: number;

  @Prop({ default: TRONG_SO_MAC_DINH.phongThuy, min: 0, max: 100 })
  phongThuy!: number;
}

@Schema({ _id: false })
export class HanMucAI {
  /** Số câu hỏi mỗi tháng cho người dùng không trả phí. */
  @Prop({ default: 15, min: 0, max: 1000 })
  mienPhi!: number;

  @Prop({ default: 70, min: 1, max: 10000 })
  goiCoBan!: number;

  @Prop({ default: 150, min: 1, max: 10000 })
  goiNangCao!: number;

  /** Chặn chi phí phình theo ngữ cảnh khi hội thoại kéo dài. */
  @Prop({ default: 10, min: 2, max: 100 })
  soLuotMoiHoiThoai!: number;

  /** Giới hạn cứng: token bị lộ cũng không đốt hết hạn mức trong một đêm. */
  @Prop({ default: 10, min: 1, max: 1000 })
  soCauMoiGio!: number;
}

@Schema({ _id: false })
export class GiaGoi {
  @Prop({ default: 39000, min: 0 })
  coBan!: number;

  @Prop({ default: 69000, min: 0 })
  nangCao!: number;
}

@Schema({ _id: false })
export class ThongBaoBaoTri {
  @Prop({ default: false })
  dangBat!: boolean;

  @Prop({ default: '', trim: true })
  noiDung!: string;
}

export type CauHinhDocument = HydratedDocument<CauHinh>;

/**
 * Cấu hình toàn hệ thống — chỉ có ĐÚNG MỘT bản ghi.
 *
 * Mục đích: Admin đổi hạn mức, giá gói, trọng số gợi ý và bật tắt tính năng
 * mà không phải phát hành lại ứng dụng và chờ hai kho duyệt.
 */
@Schema({ collection: 'app_config', timestamps: true })
export class CauHinh {
  /** Khoá cố định, đảm bảo chỉ tồn tại một bản ghi duy nhất. */
  @Prop({ required: true, unique: true, default: 'mac-dinh' })
  khoa!: string;

  @Prop({ type: HanMucAI, default: () => ({}) })
  hanMucAI!: HanMucAI;

  @Prop({ type: GiaGoi, default: () => ({}) })
  giaGoi!: GiaGoi;

  @Prop({ type: TrongSoGoiY, default: () => ({}) })
  trongSoGoiY!: TrongSoGoiY;

  /**
   * Công tắc tính năng. Tắt một tính năng là nó biến mất khỏi ứng dụng ngay,
   * không cần bản cập nhật mới.
   */
  @Prop({
    type: Object,
    default: () => ({
      choVatTu: true,
      congDong: false,
      nhanTinRieng: false,
      troLyAI: true,
      thanhToan: false,
    }),
  })
  congTacTinhNang!: Record<string, boolean>;

  @Prop({ type: ThongBaoBaoTri, default: () => ({}) })
  thongBaoBaoTri!: ThongBaoBaoTri;
}

export const CauHinhSchema = SchemaFactory.createForClass(CauHinh);
