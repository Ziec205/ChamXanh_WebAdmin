import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AdminRole } from '../src/modules/admin-users/schemas/admin-user.schema';

const MAT_KHAU = 'MatKhauManh!2026';

describe('Hướng dẫn chăm sóc — /huong-dan-cham-soc (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let tokenAdmin: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    http = request(app.getHttpServer());

    await app.get(AdminUsersService).taoMoi({
      email: 'admin-hdcs@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Quản trị',
      vaiTro: AdminRole.Admin,
    });
    const dn = await http
      .post('/api/v1/auth/dang-nhap')
      .send({ email: 'admin-hdcs@chamxanh.vn', matKhau: MAT_KHAU });
    tokenAdmin = dn.body.duLieu.accessToken;
  }, 120_000);

  afterAll(async () => {
    if (app) await app.close();
  });

  it('nạp mặc định thành công, đủ 4 loại việc', async () => {
    const res = await http
      .post('/api/v1/huong-dan-cham-soc/nap-mac-dinh')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(201);
    expect(res.body.duLieu.themMoi + res.body.duLieu.boQua).toBe(4);
  });

  it('nạp lần hai không tạo trùng', async () => {
    const res = await http
      .post('/api/v1/huong-dan-cham-soc/nap-mac-dinh')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(201);
    expect(res.body.duLieu.themMoi).toBe(0);
    expect(res.body.duLieu.boQua).toBe(4);
  });

  it('GET danh sách không cần token', async () => {
    const res = await http.get('/api/v1/huong-dan-cham-soc').expect(200);
    expect(res.body.duLieu.length).toBe(4);
  });

  it('GET theo loại không cần token', async () => {
    const res = await http.get('/api/v1/huong-dan-cham-soc/thay đất').expect(200);
    expect(res.body.duLieu.cacBuoc.length).toBeGreaterThanOrEqual(3);
  });

  it('404 khi loại không tồn tại', async () => {
    await http.get('/api/v1/huong-dan-cham-soc/khong-ton-tai').expect(404);
  });

  it('gửi kèm loai khi sửa không làm đổi khoá', async () => {
    const res = await http
      .patch('/api/v1/huong-dan-cham-soc/tưới')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ loai: 'bón phân', tieuDe: 'Tưới đúng cách — bản sửa' })
      .expect(200);
    expect(res.body.duLieu.loai).toBe('tưới');
    expect(res.body.duLieu.tieuDe).toBe('Tưới đúng cách — bản sửa');
  });
});
