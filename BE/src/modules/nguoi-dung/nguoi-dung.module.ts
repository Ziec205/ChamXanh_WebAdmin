import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDungController } from './nguoi-dung.controller';
import { NguoiDung, NguoiDungSchema } from './schemas/nguoi-dung.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: NguoiDung.name, schema: NguoiDungSchema }])],
  controllers: [NguoiDungController],
  providers: [NguoiDungService],
  exports: [MongooseModule],
})
export class NguoiDungModule {}
