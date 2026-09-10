import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ThongBaoService } from './thong-bao.service';
import { ViecChamSoc, ViecChamSocSchema } from '../vuon/schemas/viec-cham-soc.schema';
import { NguoiDungModule } from '../nguoi-dung/nguoi-dung.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ViecChamSoc.name, schema: ViecChamSocSchema }]),
    NguoiDungModule,
  ],
  providers: [ThongBaoService],
  exports: [ThongBaoService],
})
export class ThongBaoModule {}
