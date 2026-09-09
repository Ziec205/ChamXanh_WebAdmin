/**
 * Tạo tài khoản quản trị đầu tiên.
 * Chạy: npm run seed:admin
 * Chỉ chạy được một lần — nếu đã có tài khoản admin thì script tự dừng.
 */
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '../app.module';
import { AdminUsersService } from '../modules/admin-users/admin-users.service';
import { AdminRole } from '../modules/admin-users/schemas/admin-user.schema';

async function chay() {
  const logger = new Logger('SeedAdmin');
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  try {
    const service = app.get(AdminUsersService);

    const daCo = await service.demTheoVai(AdminRole.Admin);
    if (daCo > 0) {
      logger.warn(`Đã có ${daCo} tài khoản admin. Không tạo thêm.`);
      return;
    }

    const email = process.env.SEED_ADMIN_EMAIL;
    const matKhau = process.env.SEED_ADMIN_PASSWORD;
    const hoTen = process.env.SEED_ADMIN_NAME ?? 'Quản trị viên';

    if (!email || !matKhau) {
      throw new Error('Thiếu SEED_ADMIN_EMAIL hoặc SEED_ADMIN_PASSWORD trong tệp .env');
    }
    if (matKhau.length < 10) {
      throw new Error('SEED_ADMIN_PASSWORD phải dài ít nhất 10 ký tự.');
    }

    await service.taoMoi({ email, matKhau, hoTen, vaiTro: AdminRole.Admin });

    logger.log(`Đã tạo tài khoản admin: ${email}`);
    logger.warn('Đăng nhập xong hãy đổi mật khẩu ngay và xoá SEED_ADMIN_PASSWORD khỏi .env');
  } finally {
    await app.close();
  }
}

chay().catch((e) => {
  console.error('Tạo tài khoản admin thất bại:', e.message);
  process.exit(1);
});
