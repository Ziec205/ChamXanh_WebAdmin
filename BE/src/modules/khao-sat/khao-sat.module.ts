import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KhaoSatService } from './khao-sat.service';
import { KhaoSatController } from './khao-sat.controller';
import { CauHoi, CauHoiSchema } from './schemas/cau-hoi.schema';
import { HoSoNguoiDung, HoSoNguoiDungSchema } from './schemas/ho-so-nguoi-dung.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CauHoi.name, schema: CauHoiSchema },
      { name: HoSoNguoiDung.name, schema: HoSoNguoiDungSchema },
    ]),
  ],
  controllers: [KhaoSatController],
  providers: [KhaoSatService],
  exports: [KhaoSatService],
})
export class KhaoSatModule {}
