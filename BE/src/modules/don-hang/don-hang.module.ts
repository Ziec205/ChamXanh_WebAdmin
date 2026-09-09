import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DonHangService } from './don-hang.service';
import { DonHangController } from './don-hang.controller';
import { DonHang, DonHangSchema } from './schemas/don-hang.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: DonHang.name, schema: DonHangSchema }])],
  controllers: [DonHangController],
  providers: [DonHangService],
})
export class DonHangModule {}
