import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDungController } from './nguoi-dung.controller';
import { NguoiDungAuthService } from './nguoi-dung-auth.service';
import { NguoiDungAuthController } from './nguoi-dung-auth.controller';
import { JwtAppStrategy } from './strategies/jwt-app.strategy';
import { NguoiDung, NguoiDungSchema } from './schemas/nguoi-dung.schema';
import {
  RefreshTokenNguoiDung,
  RefreshTokenNguoiDungSchema,
} from './schemas/refresh-token-nguoi-dung.schema';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    MongooseModule.forFeature([
      { name: NguoiDung.name, schema: NguoiDungSchema },
      { name: RefreshTokenNguoiDung.name, schema: RefreshTokenNguoiDungSchema },
    ]),
  ],
  controllers: [NguoiDungController, NguoiDungAuthController],
  providers: [NguoiDungService, NguoiDungAuthService, JwtAppStrategy],
  exports: [MongooseModule, NguoiDungService],
})
export class NguoiDungModule {}
