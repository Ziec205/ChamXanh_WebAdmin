import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GioHangService } from './gio-hang.service';
import { GioHangController } from './gio-hang.controller';
import { GioHang, GioHangSchema } from './schemas/gio-hang.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: GioHang.name, schema: GioHangSchema }])],
  controllers: [GioHangController],
  providers: [GioHangService],
  exports: [GioHangService],
})
export class GioHangModule {}
