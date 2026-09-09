import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LienKetTiepThiService } from './lien-ket-tiep-thi.service';
import { LienKetTiepThiController } from './lien-ket-tiep-thi.controller';
import { LienKetTiepThi, LienKetTiepThiSchema } from './schemas/lien-ket.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: LienKetTiepThi.name, schema: LienKetTiepThiSchema }])],
  controllers: [LienKetTiepThiController],
  providers: [LienKetTiepThiService],
})
export class LienKetTiepThiModule {}
