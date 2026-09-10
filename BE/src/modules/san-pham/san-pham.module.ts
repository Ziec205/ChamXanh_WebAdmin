import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SanPhamService } from './san-pham.service';
import { SanPhamController } from './san-pham.controller';
import { SanPhamAppController } from './san-pham-app.controller';
import { SanPham, SanPhamSchema } from './schemas/san-pham.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: SanPham.name, schema: SanPhamSchema }])],
  controllers: [SanPhamController, SanPhamAppController],
  providers: [SanPhamService],
  exports: [SanPhamService],
})
export class SanPhamModule {}
