import { Module } from '@nestjs/common';
import { GoiYService } from './goi-y.service';
import { GoiYController } from './goi-y.controller';
import { PlantsModule } from '../plants/plants.module';

@Module({
  imports: [PlantsModule],
  controllers: [GoiYController],
  providers: [GoiYService],
  exports: [GoiYService],
})
export class GoiYModule {}
