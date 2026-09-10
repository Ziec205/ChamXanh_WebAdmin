import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration';
import { validateEnv } from './config/env.validation';
import { AuthModule } from './modules/auth/auth.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { HealthModule } from './modules/health/health.module';
import { PlantsModule } from './modules/plants/plants.module';
import { KhaoSatModule } from './modules/khao-sat/khao-sat.module';
import { GoiYModule } from './modules/goi-y/goi-y.module';
import { NhatKyModule } from './modules/nhat-ky/nhat-ky.module';
import { CauHinhModule } from './modules/cau-hinh/cau-hinh.module';
import { LienKetTiepThiModule } from './modules/lien-ket-tiep-thi/lien-ket-tiep-thi.module';
import { KhamPhaModule } from './modules/kham-pha/kham-pha.module';
import { TrangGioiThieuModule } from './modules/trang-gioi-thieu/trang-gioi-thieu.module';
import { NguoiDungModule } from './modules/nguoi-dung/nguoi-dung.module';
import { KiemDuyetModule } from './modules/kiem-duyet/kiem-duyet.module';
import { SanPhamModule } from './modules/san-pham/san-pham.module';
import { DonHangModule } from './modules/don-hang/don-hang.module';
import { VuonModule } from './modules/vuon/vuon.module';
import { HuongDanChamSocModule } from './modules/huong-dan-cham-soc/huong-dan-cham-soc.module';
import { GioChoChamSocModule } from './modules/gio-cho-cham-soc/gio-cho-cham-soc.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Khi kiểm thử, biến môi trường do global-setup đặt — không đọc .env.
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      load: [configuration],
      validate: validateEnv,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongodbUri'),
        serverSelectionTimeoutMS: 10_000,
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
      // Chỉ bỏ qua khi chạy kiểm thử, và chỉ khi bộ test không chủ động bật.
      // Ngoài môi trường test, điều kiện đầu luôn sai nên không bao giờ bỏ qua.
      skipIf: () =>
        process.env.NODE_ENV === 'test' && process.env.THROTTLE_ENABLED !== 'true',
    }),
    AuthModule,
    AdminUsersModule,
    // Global — phải nạp trước các module dùng tới chúng.
    NhatKyModule,
    CauHinhModule,
    HealthModule,
    PlantsModule,
    KhaoSatModule,
    GoiYModule,
    LienKetTiepThiModule,
    KhamPhaModule,
    TrangGioiThieuModule,
    NguoiDungModule,
    KiemDuyetModule,
    SanPhamModule,
    DonHangModule,
    VuonModule,
    HuongDanChamSocModule,
    GioChoChamSocModule,
  ],
  providers: [
    // Thứ tự quan trọng: chặn tần suất → xác thực → phân quyền.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
  ],
})
export class AppModule {}
