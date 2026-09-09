import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KhamPhaService } from './kham-pha.service';
import { KhamPhaController } from './kham-pha.controller';
import { KhamPha, KhamPhaSchema } from './schemas/kham-pha.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: KhamPha.name, schema: KhamPhaSchema }])],
  controllers: [KhamPhaController],
  providers: [KhamPhaService],
})
export class KhamPhaModule {}
