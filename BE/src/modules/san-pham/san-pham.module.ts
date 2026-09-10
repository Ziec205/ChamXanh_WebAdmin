import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SanPhamService } from './san-pham.service';
import { SanPhamController } from './san-pham.controller';
import { SanPham, SanPhamSchema } from './schemas/san-pham.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: SanPham.name, schema: SanPhamSchema }])],
  controllers: [SanPhamController],
  providers: [SanPhamService],
  exports: [SanPhamService],
})
export class SanPhamModule {}
