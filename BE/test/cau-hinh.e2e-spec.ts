import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AdminRole } from '../src/modules/admin-users/schemas/admin-user.schema';

const MAT_KHAU = 'MatKhauManh!2026';

describe('Cấu hình, nhật ký và đổi mật khẩu (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let tokenAdmin: string;
  let tokenContent: string;

  const dangNhap = async (email: string, matKhau = MAT_KHAU) => {
    const res = await http.post('/api/v1/auth/dang-nhap').send({ email, matKhau });
    return res.body.duLieu?.accessToken as string;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    http = request(app.getHttpServer());

    const nguoiDung = app.get(AdminUsersService);
    await nguoiDung.taoMoi({
      email: 'admin-cauhinh@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Quản trị',
      vaiTro: AdminRole.Admin,
    });
    await nguoiDung.taoMoi({
      email: 'content-cauhinh@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Nội dung',
      vaiTro: AdminRole.Content,
    });

    tokenAdmin = await dangNhap('admin-cauhinh@chamxanh.vn');
    tokenContent = await dangNhap('content-cauhinh@chamxanh.vn');
  }, 120_000);

  afterAll(async () => {
    await app?.close();
  });

  // ============================================================
  describe('Cấu hình hệ thống', () => {
    it('tự tạo bản mặc định ở lần đọc đầu tiên', async () => {
      const res = await http
        .get('/api/v1/cau-hinh')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.duLieu.hanMucAI.goiCoBan).toBe(70);
      expect(res.body.duLieu.hanMucAI.goiNangCao).toBe(150);
      expect(res.body.duLieu.giaGoi).toMatchObject({ coBan: 39000, nangCao: 69000 });
    });

    it('trọng số gợi ý mặc định khớp với đặc tả', async () => {
      const res = await http.get('/api/v1/cau-hinh').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.body.duLieu.trongSoGoiY).toMatchObject({
        anhSang: 30,
        thoiGian: 20,
        kinhNghiem: 15,
        dienTich: 15,
        mucDich: 10,
        phongThuy: 10,
      });
    });

    it('vai content KHÔNG sửa được cấu hình', async () => {
      await http
        .patch('/api/v1/cau-hinh')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ hanMucAI: { mienPhi: 999 } })
        .expect(403);
    });

    it('vai admin sửa được và giá trị có hiệu lực ngay', async () => {
      await http
        .patch('/api/v1/cau-hinh')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ hanMucAI: { mienPhi: 5 } })
        .expect(200);

      const res = await http.get('/api/v1/cau-hinh').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.body.duLieu.hanMucAI.mienPhi).toBe(5);
    });

    it('từ chối giá trị ngoài khoảng cho phép', async () => {
      await http
        .patch('/api/v1/cau-hinh')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ hanMucAI: { soLuotMoiHoiThoai: 1 } })
        .expect(400);
    });

    it('bật tắt được công tắc tính năng', async () => {
      await http
        .patch('/api/v1/cau-hinh')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ congTacTinhNang: { choVatTu: true, congDong: true } })
        .expect(200);

      const res = await http.get('/api/v1/cau-hinh').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(res.body.duLieu.congTacTinhNang.congDong).toBe(true);
    });
  });

  // ============================================================
  describe('Trọng số cấu hình ảnh hưởng thật tới gợi ý', () => {
    it('đổi trọng số phong thuỷ về 0 thì điểm thay đổi', async () => {
      const khaoSat = {
        noiDat: 'gần cửa sổ',
        huong: 'Nam',
        dienTich: '3-10m²',
        kinhNghiem: 'đã trồng vài cây',
        thoiGianRanh: '15-30 phút mỗi ngày',
        coThuNuoi: false,
        mien: 'Nam',
        menh: 'Mộc',
      };

      const truoc = await http
        .post('/api/v1/goi-y')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(khaoSat)
        .expect(201);

      expect(truoc.body.duLieu.trongSoDaDung.phongThuy).toBe(10);

      await http
        .patch('/api/v1/cau-hinh')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ trongSoGoiY: { phongThuy: 0 } })
        .expect(200);

      const sau = await http
        .post('/api/v1/goi-y')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(khaoSat)
        .expect(201);

      // Bộ nhớ tạm phải bị xoá ngay khi sửa cấu hình, không chờ hết hạn 30 giây.
      expect(sau.body.duLieu.trongSoDaDung.phongThuy).toBe(0);
    });
  });

  // ============================================================
  describe('Nhật ký thao tác', () => {
    it('ghi lại việc sửa cấu hình kèm giá trị trước và sau', async () => {
      const res = await http
        .get('/api/v1/nhat-ky?doiTuong=cau-hinh')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.duLieu.tong).toBeGreaterThan(0);

      const ban_ghi = res.body.duLieu.muc[0];
      expect(ban_ghi.hanhDong).toBe('cập nhật cấu hình hệ thống');
      expect(ban_ghi.email).toBe('admin-cauhinh@chamxanh.vn');
      expect(ban_ghi.vaiTro).toBe('admin');
      expect(ban_ghi.truocKhi).not.toBeNull();
      expect(ban_ghi.sauKhi).not.toBeNull();
    });

    it('vai content KHÔNG xem được nhật ký', async () => {
      await http
        .get('/api/v1/nhat-ky')
        .set('Authorization', `Bearer ${tokenContent}`)
        .expect(403);
    });

    it('lọc được theo đối tượng', async () => {
      const res = await http
        .get('/api/v1/nhat-ky?doiTuong=khong-co-doi-tuong-nay')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.duLieu.tong).toBe(0);
    });
  });

  // ============================================================
  describe('Đổi mật khẩu', () => {
    const EMAIL = 'doi-mk@chamxanh.vn';
    const MAT_KHAU_MOI = 'MatKhauMoiRatManh!2026';
    let token: string;

    beforeAll(async () => {
      await app.get(AdminUsersService).taoMoi({
        email: EMAIL,
        matKhau: MAT_KHAU,
        hoTen: 'Đổi mật khẩu',
        vaiTro: AdminRole.Support,
      });
      token = await dangNhap(EMAIL);
    });

    it('từ chối khi mật khẩu hiện tại sai', async () => {
      await http
        .post('/api/v1/auth/doi-mat-khau')
        .set('Authorization', `Bearer ${token}`)
        .send({ matKhauHienTai: 'SaiRoi!2026', matKhauMoi: MAT_KHAU_MOI })
        .expect(401);
    });

    it('từ chối khi mật khẩu mới trùng mật khẩu cũ', async () => {
      await http
        .post('/api/v1/auth/doi-mat-khau')
        .set('Authorization', `Bearer ${token}`)
        .send({ matKhauHienTai: MAT_KHAU, matKhauMoi: MAT_KHAU })
        .expect(400);
    });

    it('từ chối mật khẩu mới quá ngắn', async () => {
      await http
        .post('/api/v1/auth/doi-mat-khau')
        .set('Authorization', `Bearer ${token}`)
        .send({ matKhauHienTai: MAT_KHAU, matKhauMoi: 'ngan' })
        .expect(400);
    });

    it('đổi thành công, mật khẩu cũ không dùng được nữa', async () => {
      await http
        .post('/api/v1/auth/doi-mat-khau')
        .set('Authorization', `Bearer ${token}`)
        .send({ matKhauHienTai: MAT_KHAU, matKhauMoi: MAT_KHAU_MOI })
        .expect(204);

      await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU })
        .expect(401);

      await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU_MOI })
        .expect(200);
    });

    it('mọi phiên đăng nhập cũ bị thu hồi sau khi đổi', async () => {
      // Đăng nhập lấy refresh token, rồi đổi mật khẩu, rồi thử làm mới.
      const truoc = await http
        .post('/api/v1/auth/dang-nhap')
        .send({ email: EMAIL, matKhau: MAT_KHAU_MOI });

      const refreshCu = truoc.body.duLieu.refreshToken;
      const accessMoi = truoc.body.duLieu.accessToken;

      await http
        .post('/api/v1/auth/doi-mat-khau')
        .set('Authorization', `Bearer ${accessMoi}`)
        .send({ matKhauHienTai: MAT_KHAU_MOI, matKhauMoi: 'MotMatKhauKhacNua!2026' })
        .expect(204);

      // Kẻ chiếm tài khoản đang giữ refresh token cũ phải bị đá ra ngay.
      await http.post('/api/v1/auth/lam-moi').send({ refreshToken: refreshCu }).expect(401);
    });
  });
});
