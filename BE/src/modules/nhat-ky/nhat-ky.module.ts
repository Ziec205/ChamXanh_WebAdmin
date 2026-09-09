import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NhatKyService } from './nhat-ky.service';
import { NhatKyController } from './nhat-ky.controller';
import { NhatKy, NhatKySchema } from './schemas/nhat-ky.schema';

/** Global: mọi module đều cần ghi nhật ký, không phải import lặp đi lặp lại. */
@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: NhatKy.name, schema: NhatKySchema }])],
  controllers: [NhatKyController],
  providers: [NhatKyService],
  exports: [NhatKyService],
})
export class NhatKyModule {}
