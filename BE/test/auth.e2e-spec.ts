import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AdminRole } from '../src/modules/admin-users/schemas/admin-user.schema';

const EMAIL = 'admin@chamxanh.vn';
const MAT_KHAU = 'MatKhauManh!2026';

describe('Xác thực Web Admin (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    // Filter và interceptor đã do AppModule đăng ký toàn cục.
    // Đăng ký lại ở đây sẽ bọc phản hồi hai lớp.
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();

    http = request(app.getHttpServer());

    await app.get(AdminUsersService).taoMoi({
      email: EMAIL,
      matKhau: MAT_KHAU,
      hoTen: 'Quản trị viên',
      vaiTro: AdminRole.Admin,
    });
  }, 120_000);

  afterAll(async () => {
    await app?.close();
  });

  describe('POST /auth/dang-nhap', () => {
    it('đăng nhập thành công và trả về hai token', async () => {
      const res = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU })
        .expect(200);

      expect(res.body.thanhCong).toBe(true);
      expect(res.body.duLieu.accessToken).toEqual(expect.any(String));
      expect(res.body.duLieu.refreshToken).toEqual(expect.any(String));
      expect(res.body.duLieu.nguoiDung).toMatchObject({ email: EMAIL, vaiTro: 'admin' });
    });

    it('KHÔNG BAO GIỜ trả về mật khẩu băm', async () => {
      const res = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU })
        .expect(200);

      expect(JSON.stringify(res.body)).not.toContain('matKhauBam');
      expect(JSON.stringify(res.body)).not.toContain('$2b$');
    });

    it('từ chối sai mật khẩu, không tiết lộ email có tồn tại hay không', async () => {
      const saiMatKhau = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: 'SaiBetNhe!2026' })
        .expect(401);

      const khongTonTai = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: 'khong-co-ai@chamxanh.vn', matKhau: 'SaiBetNhe!2026' })
        .expect(401);

      // Hai thông báo phải giống hệt nhau, nếu không sẽ dò được email nào có thật.
      expect(saiMatKhau.body.thongBao).toBe(khongTonTai.body.thongBao);
    });

    it('từ chối email sai định dạng', async () => {
      await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: 'khong-phai-email', matKhau: MAT_KHAU })
        .expect(400);
    });
  });

  describe('Bảo vệ endpoint', () => {
    it('chặn khi không có token', async () => {
      await http.get('/api/v1/auth/toi').expect(401);
    });

    it('chặn khi token bịa', async () => {
      await http
        .get('/api/v1/auth/toi')
        .set('Authorization', 'Bearer token.hoan.toan.bia')
        .expect(401);
    });

    it('cho qua khi token hợp lệ', async () => {
      const dangNhap = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU });

      const res = await http
        .get('/api/v1/auth/toi')
        .set('Authorization', `Bearer ${dangNhap.body.duLieu.accessToken}`)
        .expect(200);

      expect(res.body.duLieu).toMatchObject({ email: EMAIL, role: 'admin' });
    });

    it('endpoint công khai không cần token', async () => {
      const res = await http.get('/api/v1/health').expect(200);
      expect(res.body.duLieu.trangThai).toBe('ổn');
    });
  });

  describe('Xoay vòng refresh token', () => {
    it('đổi được token mới', async () => {
      const dangNhap = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU });

      const res = await http
        .post('/api/v1/auth/lam-moi')
        .send({ refreshToken: dangNhap.body.duLieu.refreshToken })
        .expect(200);

      expect(res.body.duLieu.accessToken).toEqual(expect.any(String));
      expect(res.body.duLieu.refreshToken).not.toBe(dangNhap.body.duLieu.refreshToken);
    });

    it('token cũ bị thu hồi ngay sau khi làm mới', async () => {
      const dangNhap = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU });

      const cu = dangNhap.body.duLieu.refreshToken;
      await http.post('/api/v1/auth/lam-moi').send({ refreshToken: cu }).expect(200);

      // Dùng lại token cũ phải bị từ chối — đây là điểm chặn tấn công phát lại.
      await http.post('/api/v1/auth/lam-moi').send({ refreshToken: cu }).expect(401);
    });

    it('từ chối refresh token bịa', async () => {
      await http
        .post('/api/v1/auth/lam-moi')
        .send({ refreshToken: 'chuoi_bia_dat_dai_hon_hai_muoi_ky_tu' })
        .expect(401);
    });

    it('đăng xuất thì token không dùng lại được', async () => {
      const dangNhap = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU });

      const token = dangNhap.body.duLieu.refreshToken;
      await http.post('/api/v1/auth/dang-xuat').send({ refreshToken: token }).expect(204);
      await http.post('/api/v1/auth/lam-moi').send({ refreshToken: token }).expect(401);
    });
  });

  describe('Phân quyền theo vai', () => {
    let tokenContent: string;

    beforeAll(async () => {
      await app.get(AdminUsersService).taoMoi({
        email: 'content@chamxanh.vn',
        matKhau: MAT_KHAU,
        hoTen: 'Nhân sự nội dung',
        vaiTro: AdminRole.Content,
      });
      const res = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: 'content@chamxanh.vn', matKhau: MAT_KHAU });
      tokenContent = res.body.duLieu.accessToken;
    });

    it('vai content KHÔNG vào được trang tài khoản quản trị', async () => {
      const res = await http
        .get('/api/v1/admin-users')
        .set('Authorization', `Bearer ${tokenContent}`)
        .expect(403);

      expect(res.body.thongBao).toContain('admin');
    });

    it('vai admin vào được', async () => {
      const dangNhap = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU });

      const res = await http
        .get('/api/v1/admin-users')
        .set('Authorization', `Bearer ${dangNhap.body.duLieu.accessToken}`)
        .expect(200);

      expect(Array.isArray(res.body.duLieu)).toBe(true);
      expect(JSON.stringify(res.body)).not.toContain('matKhauBam');
    });
  });

  describe('Vô hiệu hoá tài khoản có hiệu lực ngay', () => {
    it('token đang còn hạn cũng bị chặn sau khi tài khoản bị khoá', async () => {
      const service = app.get(AdminUsersService);
      const nguoiDung = await service.taoMoi({
        email: 'sap-bi-khoa@chamxanh.vn',
        matKhau: MAT_KHAU,
        hoTen: 'Sắp bị khoá',
        vaiTro: AdminRole.Support,
      });

      const dangNhap = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: 'sap-bi-khoa@chamxanh.vn', matKhau: MAT_KHAU });
      const token = dangNhap.body.duLieu.accessToken;

      // Trước khi khoá: vào được
      await http.get('/api/v1/auth/toi').set('Authorization', `Bearer ${token}`).expect(200);

      await service.doiTrangThai(String(nguoiDung._id), false);

      // Sau khi khoá: bị chặn ngay, không phải chờ access token hết hạn.
      await http.get('/api/v1/auth/toi').set('Authorization', `Bearer ${token}`).expect(401);
    });
  });
});
