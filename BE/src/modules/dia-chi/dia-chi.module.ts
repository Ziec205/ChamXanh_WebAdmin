import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiaChiService } from './dia-chi.service';
import { DiaChiController } from './dia-chi.controller';
import { DiaChi, DiaChiSchema } from './schemas/dia-chi.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: DiaChi.name, schema: DiaChiSchema }])],
  controllers: [DiaChiController],
  providers: [DiaChiService],
  exports: [DiaChiService],
})
export class DiaChiModule {}
