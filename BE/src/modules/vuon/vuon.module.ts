import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VuonService } from './vuon.service';
import { VuonController } from './vuon.controller';
import { CayCuaToi, CayCuaToiSchema } from './schemas/cay-cua-toi.schema';
import { ViecChamSoc, ViecChamSocSchema } from './schemas/viec-cham-soc.schema';
import { PlantsModule } from '../plants/plants.module';
import { NguoiDungModule } from '../nguoi-dung/nguoi-dung.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CayCuaToi.name, schema: CayCuaToiSchema },
      { name: ViecChamSoc.name, schema: ViecChamSocSchema },
    ]),
    PlantsModule,
    NguoiDungModule,
  ],
  controllers: [VuonController],
  providers: [VuonService],
})
export class VuonModule {}
