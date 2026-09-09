import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CauHinhService } from './cau-hinh.service';
import { CauHinhController } from './cau-hinh.controller';
import { CauHinh, CauHinhSchema } from './schemas/cau-hinh.schema';

/** Global: hạn mức và công tắc tính năng được đọc ở rất nhiều nơi. */
@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: CauHinh.name, schema: CauHinhSchema }])],
  controllers: [CauHinhController],
  providers: [CauHinhService],
  exports: [CauHinhService],
})
export class CauHinhModule {}
