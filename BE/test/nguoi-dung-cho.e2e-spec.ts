import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AdminRole } from '../src/modules/admin-users/schemas/admin-user.schema';
import { NguoiDung, NguoiDungDocument } from '../src/modules/nguoi-dung/schemas/nguoi-dung.schema';
import { BaoCao, BaoCaoDocument } from '../src/modules/kiem-duyet/schemas/bao-cao.schema';
import { SanPham, SanPhamDocument } from '../src/modules/san-pham/schemas/san-pham.schema';
import { DonHang, DonHangDocument } from '../src/modules/don-hang/schemas/don-hang.schema';

const MAT_KHAU = 'MatKhauManh!2026';

describe('Người dùng, kiểm duyệt, sản phẩm, đơn hàng (đầu cuối)', () => {
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
      email: 'admin-ndhb@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Quản trị',
      vaiTro: AdminRole.Admin,
    });
    await nguoiDung.taoMoi({
      email: 'content-ndhb@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Nội dung',
      vaiTro: AdminRole.Content,
    });
    await nguoiDung.taoMoi({
      email: 'support-ndhb@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Hỗ trợ',
      vaiTro: AdminRole.Support,
    });

    tokenAdmin = await dangNhap('admin-ndhb@chamxanh.vn');
    tokenContent = await dangNhap('content-ndhb@chamxanh.vn');
    tokenSupport = await dangNhap('support-ndhb@chamxanh.vn');
  }, 120_000);

  afterAll(async () => {
    if (app) {
      await app.get<Model<NguoiDungDocument>>(getModelToken(NguoiDung.name)).deleteMany({
        email: { $regex: '@nguoidung-test\\.vn$' },
      });
      await app.get<Model<BaoCaoDocument>>(getModelToken(BaoCao.name)).deleteMany({});
      await app.get<Model<SanPhamDocument>>(getModelToken(SanPham.name)).deleteMany({});
      await app.get<Model<DonHangDocument>>(getModelToken(DonHang.name)).deleteMany({});
      await app.close();
    }
  });

  // ============================================================
  describe('Người dùng app — /nguoi-dung', () => {
    let id: string;

    it('content không được xem danh sách (chỉ admin/support)', async () => {
      await http
        .get('/api/v1/nguoi-dung')
        .set('Authorization', `Bearer ${tokenContent}`)
        .expect(403);
    });

    it('tạo trực tiếp trong Mongo để mô phỏng người dùng có sẵn, rồi tra cứu qua API', async () => {
      const model = app.get<Model<NguoiDungDocument>>(getModelToken(NguoiDung.name));
      const nd = await model.create({
        email: 'khach-hang@nguoidung-test.vn',
        hoTen: 'Khách Test',
        matKhauBam: 'khong-dung-de-dang-nhap',
      });
      id = String(nd._id);

      const res = await http
        .get('/api/v1/nguoi-dung?email=nguoidung-test')
        .set('Authorization', `Bearer ${tokenSupport}`)
        .expect(200);
      expect(res.body.duLieu.muc.some((u: { _id: string }) => u._id === id)).toBe(true);
    });

    it('khoá tài khoản và ghi nhật ký', async () => {
      const res = await http
        .patch(`/api/v1/nguoi-dung/${id}/khoa`)
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ lyDo: 'Spam quảng cáo' })
        .expect(200);
      expect(res.body.duLieu.dangHoatDong).toBe(false);
      expect(res.body.duLieu.lyDoKhoa).toBe('Spam quảng cáo');
    });

    it('kích hoạt lại thành công', async () => {
      const res = await http
        .patch(`/api/v1/nguoi-dung/${id}/kich-hoat`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
      expect(res.body.duLieu.dangHoatDong).toBe(true);
    });

    it('404 khi thao tác id không tồn tại', async () => {
      await http
        .patch('/api/v1/nguoi-dung/000000000000000000000000/khoa')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({})
        .expect(404);
    });
  });

  // ============================================================
  describe('Kiểm duyệt — /kiem-duyet', () => {
    let id: string;

    beforeAll(async () => {
      const model = app.get<Model<BaoCaoDocument>>(getModelToken(BaoCao.name));
      const bc = await model.create({
        loaiDoiTuong: 'bai-viet',
        maDoiTuong: 'bai-viet-gia-lap',
        emailNguoiBaoCao: 'nguoi-bao-cao@test.vn',
        lyDo: 'Nội dung phản cảm',
      });
      id = String(bc._id);
    });

    it('mặc định ở trạng thái chờ xử lý', async () => {
      const res = await http
        .get('/api/v1/kiem-duyet?trangThai=cho-xu-ly')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
      expect(res.body.duLieu.some((b: { _id: string }) => b._id === id)).toBe(true);
    });

    it('từ chối trạng thái không hợp lệ', async () => {
      await http
        .patch(`/api/v1/kiem-duyet/${id}`)
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ trangThai: 'khong-ton-tai' })
        .expect(400);
    });

    it('xử lý thành công', async () => {
      const res = await http
        .patch(`/api/v1/kiem-duyet/${id}`)
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ trangThai: 'da-xu-ly', ghiChuXuLy: 'Đã gỡ bài' })
        .expect(200);
      expect(res.body.duLieu.trangThai).toBe('da-xu-ly');
    });
  });

  // ============================================================
  describe('Sản phẩm — /san-pham', () => {
    let id: string;

    it('từ chối giá âm', async () => {
      await http
        .post('/api/v1/san-pham')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ ten: 'Đất trồng cây 5kg', nhom: 'dat', gia: -1000 })
        .expect(400);
    });

    it('tạo thành công, tồn kho mặc định 0', async () => {
      const res = await http
        .post('/api/v1/san-pham')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ ten: 'Đất trồng cây 5kg', nhom: 'dat', gia: 45000 })
        .expect(201);
      id = res.body.duLieu._id;
      expect(res.body.duLieu.tonKho).toBe(0);
      expect(res.body.duLieu.vendorId).toBe('chamxanh');
    });

    it('cập nhật tồn kho', async () => {
      const res = await http
        .patch(`/api/v1/san-pham/${id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ tonKho: 100 })
        .expect(200);
      expect(res.body.duLieu.tonKho).toBe(100);
    });

    it('xoá thành công', async () => {
      await http
        .delete(`/api/v1/san-pham/${id}`)
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
    });
  });

  // ============================================================
  describe('Đơn hàng — /don-hang', () => {
    let id: string;

    beforeAll(async () => {
      const model = app.get<Model<DonHangDocument>>(getModelToken(DonHang.name));
      const dh = await model.create({
        nguoiDungId: '000000000000000000000099',
        emailKhachHang: 'khach@test.vn',
        danhSachHang: [
          { sanPhamId: '000000000000000000000001', tenSanPham: 'Đất trồng cây', gia: 45000, soLuong: 2 },
        ],
        tongTien: 90000,
        phuongThucThanhToan: 'cod',
        diaChiGiao: {
          hoTen: 'Khách Test',
          soDienThoai: '0900000000',
          diaChiChiTiet: '123 Đường Test, Quận 1',
        },
      });
      id = String(dh._id);
    });

    it('liệt kê thấy đơn vừa tạo, mặc định chờ xác nhận', async () => {
      const res = await http
        .get('/api/v1/don-hang')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);
      const dh = res.body.duLieu.find((d: { _id: string }) => d._id === id);
      expect(dh.trangThai).toBe('cho-xac-nhan');
    });

    it('từ chối nhảy cóc trạng thái từ chờ xác nhận sang hoàn thành', async () => {
      await http
        .patch(`/api/v1/don-hang/${id}/trang-thai`)
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ trangThai: 'hoan-thanh' })
        .expect(400);
    });

    it('chuyển sang đang giao rồi hoàn thành hợp lệ', async () => {
      await http
        .patch(`/api/v1/don-hang/${id}/trang-thai`)
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ trangThai: 'dang-giao' })
        .expect(200);
      const res = await http
        .patch(`/api/v1/don-hang/${id}/trang-thai`)
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ trangThai: 'hoan-thanh' })
        .expect(200);
      expect(res.body.duLieu.trangThai).toBe('hoan-thanh');
    });

    it('không cho chuyển tiếp sau khi đã hoàn thành', async () => {
      await http
        .patch(`/api/v1/don-hang/${id}/trang-thai`)
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ trangThai: 'da-huy' })
        .expect(400);
    });
  });
});
