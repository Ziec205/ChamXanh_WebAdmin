import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum LoaiKhamPha {
  MeoChamSoc = 'meo-cham-soc',
  KienThuc = 'kien-thuc',
  ThuThuat = 'thu-thuat',
}

export type KhamPhaDocument = HydratedDocument<KhamPha>;

@Schema({ collection: 'discover_items', timestamps: true })
export class KhamPha {
  @Prop({ required: true, trim: true, minlength: 1 })
  tieuDe!: string;

  @Prop({ trim: true, default: '' })
  tomTat!: string;

  @Prop({ required: true })
  noiDung!: string;

  @Prop({ trim: true, default: '' })
  hinhAnh!: string;

  @Prop({ required: true, enum: LoaiKhamPha })
  loai!: LoaiKhamPha;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: false, index: true })
  daXuatBan!: boolean;
}

export const KhamPhaSchema = SchemaFactory.createForClass(KhamPha);
