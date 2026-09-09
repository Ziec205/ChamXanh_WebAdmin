import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AdminRole } from '../src/modules/admin-users/schemas/admin-user.schema';

const MAT_KHAU = 'MatKhauManh!2026';

describe('CMS — liên kết tiếp thị, khám phá, trang giới thiệu (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let tokenAdmin: string;
  let tokenContent: string;
  let tokenSupport: string;

  const dangNhap = async (email: string) => {
    const res = await http.post('/api/v1/auth/dang-nhap').send({ email, matKhau: MAT_KHAU });
    return res.body.duLieu.accessToken as string;
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
      email: 'admin-cms@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Quản trị',
      vaiTro: AdminRole.Admin,
    });
    await nguoiDung.taoMoi({
      email: 'content-cms@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Nội dung',
      vaiTro: AdminRole.Content,
    });
    await nguoiDung.taoMoi({
      email: 'support-cms@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Hỗ trợ',
      vaiTro: AdminRole.Support,
    });

    tokenAdmin = await dangNhap('admin-cms@chamxanh.vn');
    tokenContent = await dangNhap('content-cms@chamxanh.vn');
    tokenSupport = await dangNhap('support-cms@chamxanh.vn');
  }, 120_000);

  afterAll(async () => {
    if (app) await app.close();
  });

  // ============================================================
  describe('Liên kết tiếp thị — /lien-ket-tiep-thi', () => {
    let id: string;

    it('từ chối support tạo liên kết', async () => {
      await http
        .post('/api/v1/lien-ket-tiep-thi')
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ tieuDe: 'Chậu sứ mini', url: 'https://shopee.vn/x', san: 'shopee' })
        .expect(403);
    });

    it('từ chối URL không hợp lệ', async () => {
      await http
        .post('/api/v1/lien-ket-tiep-thi')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ tieuDe: 'Chậu sứ mini', url: 'khong-phai-url', san: 'shopee' })
        .expect(400);
    });

    it('từ chối sàn không hợp lệ', async () => {
      await http
        .post('/api/v1/lien-ket-tiep-thi')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ tieuDe: 'Chậu sứ mini', url: 'https://shopee.vn/x', san: 'tiki' })
        .expect(400);
    });

    it('content tạo thành công', async () => {
      const res = await http
        .post('/api/v1/lien-ket-tiep-thi')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ tieuDe: 'Chậu sứ mini', url: 'https://shopee.vn/x', san: 'shopee', tags: ['chau', 'su'] })
        .expect(201);
      id = res.body.duLieu._id;
      expect(res.body.duLieu.dangHienThi).toBe(true);
    });

    it('liệt kê thấy mục vừa tạo', async () => {
      const res = await http
        .get('/api/v1/lien-ket-tiep-thi')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
      expect(res.body.duLieu.some((m: { _id: string }) => m._id === id)).toBe(true);
    });

    it('sửa và ghi lại nhật ký thao tác', async () => {
      await http
        .patch(`/api/v1/lien-ket-tiep-thi/${id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ tieuDe: 'Chậu sứ mini — giảm giá' })
        .expect(200);

      const nk = await http
        .get('/api/v1/nhat-ky?doiTuong=lien-ket-tiep-thi')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
      const banGhi = nk.body.duLieu.muc.find(
        (b: { maDoiTuong: string; hanhDong: string }) => b.maDoiTuong === id && b.hanhDong === 'sửa liên kết tiếp thị',
      );
      expect(banGhi).toBeTruthy();
      expect(banGhi.sauKhi.tieuDe).toBe('Chậu sứ mini — giảm giá');
    });

    it('404 khi sửa id không tồn tại', async () => {
      await http
        .patch('/api/v1/lien-ket-tiep-thi/000000000000000000000000')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ tieuDe: 'x' })
        .expect(404);
    });

    it('xoá thành công, sau đó 404 khi truy vấn lại', async () => {
      await http
        .delete(`/api/v1/lien-ket-tiep-thi/${id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
      await http
        .get(`/api/v1/lien-ket-tiep-thi/${id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(404);
    });
  });

  // ============================================================
  describe('Khám phá — /kham-pha', () => {
    let id: string;

    it('từ chối loại không hợp lệ', async () => {
      await http
        .post('/api/v1/kham-pha')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ tieuDe: 'Mẹo tưới cây', noiDung: 'Nội dung...', loai: 'khong-ton-tai' })
        .expect(400);
    });

    it('tạo thành công, mặc định chưa xuất bản', async () => {
      const res = await http
        .post('/api/v1/kham-pha')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ tieuDe: 'Mẹo tưới cây', noiDung: 'Tưới vào sáng sớm', loai: 'meo-cham-soc' })
        .expect(201);
      id = res.body.duLieu._id;
      expect(res.body.duLieu.daXuatBan).toBe(false);
    });

    it('sửa để xuất bản', async () => {
      const res = await http
        .patch(`/api/v1/kham-pha/${id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ daXuatBan: true })
        .expect(200);
      expect(res.body.duLieu.daXuatBan).toBe(true);
    });

    it('support không xoá được', async () => {
      await http
        .delete(`/api/v1/kham-pha/${id}`)
        .set('Authorization', `Bearer ${tokenSupport}`)
        .expect(403);
    });

    it('admin xoá thành công', async () => {
      await http
        .delete(`/api/v1/kham-pha/${id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
    });
  });

  // ============================================================
  describe('Trang giới thiệu — /trang-gioi-thieu', () => {
    it('từ chối đường dẫn có dấu hoặc khoảng trắng', async () => {
      await http
        .post('/api/v1/trang-gioi-thieu')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ tieuDe: 'Về Chạm Xanh', duongDan: 'Về Chạm Xanh', noiDung: 'Nội dung' })
        .expect(400);
    });

    it('tạo thành công', async () => {
      const res = await http
        .post('/api/v1/trang-gioi-thieu')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ tieuDe: 'Về Chạm Xanh', duongDan: 've-cham-xanh', noiDung: 'Nội dung' })
        .expect(201);
      expect(res.body.duLieu.duongDan).toBe('ve-cham-xanh');
    });

    it('từ chối trùng đường dẫn', async () => {
      await http
        .post('/api/v1/trang-gioi-thieu')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ tieuDe: 'Trùng', duongDan: 've-cham-xanh', noiDung: 'x' })
        .expect(409);
    });

    it('gửi kèm duongDan khi sửa không làm đổi đường dẫn', async () => {
      const res = await http
        .patch('/api/v1/trang-gioi-thieu/ve-cham-xanh')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ duongDan: 'duong-dan-khac', tomTat: 'Tóm tắt mới' })
        .expect(200);
      expect(res.body.duLieu.duongDan).toBe('ve-cham-xanh');
      expect(res.body.duLieu.tomTat).toBe('Tóm tắt mới');
    });

    it('xoá thành công', async () => {
      await http
        .delete('/api/v1/trang-gioi-thieu/ve-cham-xanh')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
    });
  });
});
