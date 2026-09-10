import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DonHangService } from './don-hang.service';
import { DonHangController } from './don-hang.controller';
import { DonHangAppController } from './don-hang-app.controller';
import { DonHang, DonHangSchema } from './schemas/don-hang.schema';
import { GioHangModule } from '../gio-hang/gio-hang.module';
import { SanPhamModule } from '../san-pham/san-pham.module';
import { DiaChiModule } from '../dia-chi/dia-chi.module';
import { NguoiDungModule } from '../nguoi-dung/nguoi-dung.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DonHang.name, schema: DonHangSchema }]),
    GioHangModule,
    SanPhamModule,
    DiaChiModule,
    NguoiDungModule,
  ],
  controllers: [DonHangController, DonHangAppController],
  providers: [DonHangService],
})
export class DonHangModule {}
