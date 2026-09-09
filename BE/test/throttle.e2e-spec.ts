import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Bộ test riêng, KHÔNG tắt ThrottlerGuard.
 * Không có lớp này, một kẻ tấn công có thể dò mật khẩu không giới hạn.
 */
describe('Giới hạn tần suất đăng nhập', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.THROTTLE_ENABLED = 'true';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    // Filter và interceptor đã do AppModule đăng ký toàn cục.
    // Đăng ký lại ở đây sẽ bọc phản hồi hai lớp.
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
    delete process.env.THROTTLE_ENABLED;
  });

  it('chặn sau 5 lần thử trong một phút', async () => {
    const http = request(app.getHttpServer());
    const gui = () =>
      http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: 'ke-do-mat-khau@chamxanh.vn', matKhau: 'ThuLungTung!2026' });

    const maLoi: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await gui();
      maLoi.push(res.status);
    }

    // Năm lần đầu được xử lý (401 vì sai mật khẩu), từ lần thứ sáu bị chặn.
    expect(maLoi.slice(0, 5).every((m) => m === 401)).toBe(true);
    expect(maLoi[5]).toBe(429);
    expect(maLoi[6]).toBe(429);
  });
});
