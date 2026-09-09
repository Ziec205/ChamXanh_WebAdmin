import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KiemDuyetService } from './kiem-duyet.service';
import { KiemDuyetController } from './kiem-duyet.controller';
import { BaoCao, BaoCaoSchema } from './schemas/bao-cao.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: BaoCao.name, schema: BaoCaoSchema }])],
  controllers: [KiemDuyetController],
  providers: [KiemDuyetService],
})
export class KiemDuyetModule {}
