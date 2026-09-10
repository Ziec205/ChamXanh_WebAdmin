import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GioChoChamSocService } from './gio-cho-cham-soc.service';
import { GioChoChamSocController } from './gio-cho-cham-soc.controller';
import { MucGioCho, MucGioChoSchema } from './schemas/muc-gio-cho.schema';
import { VuonModule } from '../vuon/vuon.module';
import { SanPhamModule } from '../san-pham/san-pham.module';
import { NguoiDungModule } from '../nguoi-dung/nguoi-dung.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MucGioCho.name, schema: MucGioChoSchema }]),
    VuonModule,
    SanPhamModule,
    NguoiDungModule,
  ],
  controllers: [GioChoChamSocController],
  providers: [GioChoChamSocService],
})
export class GioChoChamSocModule {}
