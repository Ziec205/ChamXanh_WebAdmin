import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Khoá chặt các endpoint app mobile PHẢI gọi được mà không cần đăng nhập.
 * Bản thân các route này từng thiếu @Public() và bị JwtAuthGuard (dành cho
 * Web Admin) âm thầm chặn 401 — lỗi chỉ lộ ra khi thật sự thử gọi không kèm
 * token, việc mà bộ e2e cũ chưa từng làm vì luôn test bằng token admin.
 */
describe('Endpoint công khai cho app mobile — không cần token (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    http = request(app.getHttpServer());
  }, 120_000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('GET /khao-sat/cau-hoi không cần token', async () => {
    await http.get('/api/v1/khao-sat/cau-hoi').expect(200);
  });

  it('GET /cay-trong không cần token', async () => {
    await http.get('/api/v1/cay-trong').expect(200);
  });

  it('GET /cay-trong/:ma không tồn tại vẫn trả 404 (không phải 401)', async () => {
    await http.get('/api/v1/cay-trong/khong-ton-tai-abc').expect(404);
  });

  it('POST /goi-y không cần token', async () => {
    await http
      .post('/api/v1/goi-y')
      .send({
        anToanThuNuoi: true,
        anhSang: 'sáng gián tiếp',
        thoiGianRanh: 'thoải mái',
        kinhNghiem: 'mới bắt đầu',
        dienTich: '1-3m²',
        mucDich: ['trang trí'],
      })
      .expect((res) => {
        // Chỉ cần KHÔNG bị 401 — nội dung DTO đúng/sai đã có test riêng ở goi-y.e2e-spec.ts.
        if (res.status === 401) throw new Error('Bị chặn bởi guard xác thực — endpoint chưa @Public()');
      });
  });

  it('GET /cay-trong/thong-ke (chỉ Admin) vẫn bị chặn khi không có token', async () => {
    await http.get('/api/v1/cay-trong/thong-ke').expect(401);
  });

  it('GET /san-pham-dang-ban không cần token (Chợ Vật Tư)', async () => {
    await http.get('/api/v1/san-pham-dang-ban').expect(200);
  });

  it('GET /san-pham (danh mục quản trị, chưa lọc dangBan) vẫn bị chặn khi không có token', async () => {
    await http.get('/api/v1/san-pham').expect(401);
  });
});
