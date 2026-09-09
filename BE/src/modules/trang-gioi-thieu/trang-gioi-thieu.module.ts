import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrangGioiThieuService } from './trang-gioi-thieu.service';
import { TrangGioiThieuController } from './trang-gioi-thieu.controller';
import { BaiViet, BaiVietSchema } from './schemas/bai-viet.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: BaiViet.name, schema: BaiVietSchema }])],
  controllers: [TrangGioiThieuController],
  providers: [TrangGioiThieuService],
})
export class TrangGioiThieuModule {}
