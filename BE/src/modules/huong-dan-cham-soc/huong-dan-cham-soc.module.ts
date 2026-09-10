import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HuongDanChamSocService } from './huong-dan-cham-soc.service';
import { HuongDanChamSocController } from './huong-dan-cham-soc.controller';
import { HuongDanChamSoc, HuongDanChamSocSchema } from './schemas/huong-dan-cham-soc.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: HuongDanChamSoc.name, schema: HuongDanChamSocSchema }])],
  controllers: [HuongDanChamSocController],
  providers: [HuongDanChamSocService],
})
export class HuongDanChamSocModule {}
