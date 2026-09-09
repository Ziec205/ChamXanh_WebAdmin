import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  CONG_DUNG,
  MENH,
  MUC_AM,
  MUC_SANG,
  NHOM_CAY,
  type CongDung,
  type Menh,
  type MucAm,
  type MucSang,
  type NhomCay,
} from 'src/common/constants/cay-trong.const';

export type PlantDocument = HydratedDocument<Plant>;

/** Một triệu chứng bệnh và cách xử lý — nguồn cho chip triệu chứng của trợ lý AI. */
@Schema({ _id: false })
export class DauHieuBenh {
  @Prop({ required: true, trim: true })
  trieuChung!: string;

  @Prop({ required: true, trim: true })
  nguyenNhan!: string;

  @Prop({ required: true, trim: true })
  cachXuLy!: string;
}

@Schema({ collection: 'plants', timestamps: true })
export class Plant {
  // ---- Định danh ----
  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  ma!: string;

  @Prop({ required: true, trim: true, index: 'text' })
  tenVi!: string;

  @Prop({ trim: true, default: '' })
  tenEn!: string;

  @Prop({ trim: true, default: '' })
  tenKhoaHoc!: string;

  @Prop({ required: true, enum: NHOM_CAY, index: true })
  nhom!: NhomCay;

  // ---- Ánh sáng: trường lọc quan trọng nhất của thuật toán gợi ý ----
  @Prop({ required: true, enum: MUC_SANG })
  anhSangToiThieu!: MucSang;

  @Prop({ required: true, enum: MUC_SANG })
  anhSangLyTuong!: MucSang;

  // ---- Tưới: tách hai mùa vì miền Nam hai mùa còn miền Bắc bốn mùa ----
  @Prop({ required: true, min: 1, max: 60 })
  chuKyTuoiMuaKho!: number;

  @Prop({ required: true, min: 1, max: 60 })
  chuKyTuoiMuaMua!: number;

  @Prop({ default: 3, min: 1, max: 10 })
  doSauKiemTraDat!: number;

  // ---- Ba loại việc chăm sóc còn lại. Bỏ trống thì không sinh lịch cho việc đó. ----
  @Prop({ type: Number, default: null, min: 1 })
  chuKyBonPhan!: number | null;

  @Prop({ type: Number, default: null, min: 1 })
  chuKyThayDat!: number | null;

  @Prop({ default: false })
  canPhunSuong!: boolean;

  // ---- Ngưỡng chịu đựng, dùng để cảnh báo khi thời tiết cực đoan ----
  @Prop({ default: 18 })
  nhietDoNgayMin!: number;

  @Prop({ default: 30 })
  nhietDoNgayMax!: number;

  @Prop({ default: 16 })
  nhietDoDemMin!: number;

  @Prop({ default: 24 })
  nhietDoDemMax!: number;

  @Prop({ required: true, enum: MUC_AM })
  doAm!: MucAm;

  // ---- An toàn: bộ lọc CỨNG, không bao giờ gợi ý cây độc cho nhà có chó mèo ----
  @Prop({ required: true, index: true })
  anToanThuNuoi!: boolean;

  @Prop({ trim: true, default: '' })
  ghiChuDocTinh!: string;

  // ---- Độ khó và kích thước ----
  @Prop({ required: true, min: 1, max: 5, index: true })
  doKho!: number;

  @Prop({ required: true, min: 5, max: 200 })
  kichThuocChauCm!: number;

  @Prop({ type: Number, default: null, min: 1 })
  khoangCachTrongCm!: number | null;

  // ---- Phong thuỷ: người mua cây ở Việt Nam quan tâm thật sự ----
  @Prop({ type: String, enum: [...MENH, null], default: null })
  menhPhongThuy!: Menh | null;

  @Prop({ trim: true, default: '' })
  yNghiaPhongThuy!: string;

  // ---- Chỉ dành cho nhóm ăn được ----
  @Prop({ type: Number, default: null, min: 1 })
  ngayThuHoach!: number | null;

  @Prop({ type: [String], default: [] })
  trongXenDuocVoi!: string[];

  @Prop({ type: [String], default: [] })
  khongTrongCungVoi!: string[];

  // ---- Đối chiếu với mục đích người dùng khai trong khảo sát ----
  @Prop({ type: [String], enum: CONG_DUNG, default: [], index: true })
  congDung!: CongDung[];

  // ---- Nội dung hiển thị ----
  @Prop({ trim: true, default: '' })
  moTaNgan!: string;

  @Prop({ trim: true, default: '' })
  huongDanChamSoc!: string;

  @Prop({ trim: true, default: '' })
  anhUrl!: string;

  @Prop({ type: [DauHieuBenh], default: [] })
  dauHieuBenhThuongGap!: DauHieuBenh[];

  // ---- Kiểm soát chất lượng dữ liệu ----
  /**
   * Dữ liệu do máy soạn ban đầu đều là "chưa kiểm chứng".
   * Chỉ đội nội dung mới được bật lên sau khi đối chiếu ít nhất hai nguồn.
   */
  @Prop({ default: false, index: true })
  daKiemChung!: boolean;

  /** Tắt để ẩn khỏi ứng dụng mà không phải xoá dữ liệu. */
  @Prop({ default: true, index: true })
  dangHienThi!: boolean;
}

export const PlantSchema = SchemaFactory.createForClass(Plant);

// Thuật toán gợi ý luôn lọc theo ba trường này cùng lúc.
PlantSchema.index({ dangHienThi: 1, anToanThuNuoi: 1, doKho: 1 });

PlantSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret: Record<string, any>) => {
    delete ret.__v;
    return ret;
  },
});
