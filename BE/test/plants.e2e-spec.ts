import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Plant, PlantDocument } from '../src/modules/plants/schemas/plant.schema';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AdminRole } from '../src/modules/admin-users/schemas/admin-user.schema';

const MAT_KHAU = 'MatKhauManh!2026';

/** Payload tối thiểu hợp lệ — chỉ các trường bắt buộc theo CreatePlantDto. */
const CAY_HOP_LE = {
  ma: 'trau-ba',
  tenVi: 'Trầu bà',
  nhom: 'cây cảnh',
  anhSangToiThieu: 'bóng râm',
  anhSangLyTuong: 'sáng gián tiếp',
  chuKyTuoiMuaKho: 7,
  chuKyTuoiMuaMua: 10,
  doAm: 'trung bình',
  anToanThuNuoi: false,
  doKho: 1,
  kichThuocChauCm: 18,
};

describe('DTO cây trồng — tạo mới và cập nhật (đầu cuối)', () => {
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
      email: 'admin-plants@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Quản trị',
      vaiTro: AdminRole.Admin,
    });
    await nguoiDung.taoMoi({
      email: 'content-plants@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Nội dung',
      vaiTro: AdminRole.Content,
    });
    await nguoiDung.taoMoi({
      email: 'support-plants@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Hỗ trợ',
      vaiTro: AdminRole.Support,
    });

    tokenAdmin = await dangNhap('admin-plants@chamxanh.vn');
    tokenContent = await dangNhap('content-plants@chamxanh.vn');
    tokenSupport = await dangNhap('support-plants@chamxanh.vn');
  }, 120_000);

  afterAll(async () => {
    // Các tệp e2e dùng chung MỘT MongoDB trong cả lượt chạy (xem test/global-setup.ts).
    // Phải tự dọn dữ liệu cây đã tạo, nếu không sẽ làm lệch số liệu mà
    // goi-y.e2e-spec.ts và các suite khác giả định (ví dụ đúng 3 loài).
    if (app) {
      const model = app.get<Model<PlantDocument>>(getModelToken(Plant.name));
      await model.deleteMany({
        ma: {
          $in: [
            'trau-ba',
            'thieu-truong', // không thật sự tạo được (400) nhưng xoá cho chắc
            'enum-sai',
            'do-kho-sai',
            'truong-la',
            'co-benh',
            'benh-thieu-truong',
            'khong-duoc-tao',
            'content-tao-duoc',
            'vong-doi-day-du',
          ],
        },
      });
      await app.close();
    }
  });

  // ============================================================
  describe('Tạo mới — POST /cay-trong', () => {
    it('tạo thành công với payload hợp lệ', async () => {
      const res = await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(CAY_HOP_LE)
        .expect(201);

      expect(res.body.duLieu.ma).toBe('trau-ba');
      expect(res.body.duLieu.dangHienThi).toBe(true); // giá trị mặc định
      expect(res.body.duLieu.daKiemChung).toBe(false); // giá trị mặc định
    });

    it('từ chối khi thiếu trường bắt buộc', async () => {
      const { doAm, ...thieuDoAm } = CAY_HOP_LE;
      void doAm;
      const res = await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ...thieuDoAm, ma: 'thieu-truong' })
        .expect(400);

      expect(JSON.stringify(res.body.thongBao)).toContain('doAm');
    });

    it('từ chối mã có dấu hoặc khoảng trắng', async () => {
      await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ...CAY_HOP_LE, ma: 'Trầu Bà 2' })
        .expect(400);
    });

    it('từ chối giá trị enum không hợp lệ', async () => {
      const res = await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ...CAY_HOP_LE, ma: 'enum-sai', anhSangToiThieu: 'siêu sáng' })
        .expect(400);

      expect(JSON.stringify(res.body.thongBao)).toContain('anhSangToiThieu');
    });

    it('từ chối độ khó ngoài khoảng 1-5', async () => {
      await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ...CAY_HOP_LE, ma: 'do-kho-sai', doKho: 9 })
        .expect(400);
    });

    it('từ chối trường lạ thay vì âm thầm bỏ qua', async () => {
      await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ...CAY_HOP_LE, ma: 'truong-la', truongKhongTonTai: 'abc' })
        .expect(400);
    });

    it('từ chối mã trùng', async () => {
      await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(CAY_HOP_LE) // ma: 'trau-ba' đã tồn tại từ test đầu tiên
        .expect(409);
    });

    it('chấp nhận mảng dấu hiệu bệnh hợp lệ', async () => {
      const res = await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          ...CAY_HOP_LE,
          ma: 'co-benh',
          dauHieuBenhThuongGap: [
            { trieuChung: 'Lá vàng', nguyenNhan: 'Úng nước', cachXuLy: 'Giảm tưới' },
          ],
        })
        .expect(201);

      expect(res.body.duLieu.dauHieuBenhThuongGap).toHaveLength(1);
    });

    it('từ chối phần tử dấu hiệu bệnh thiếu trường con', async () => {
      const res = await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({
          ...CAY_HOP_LE,
          ma: 'benh-thieu-truong',
          dauHieuBenhThuongGap: [{ trieuChung: 'Lá vàng' }], // thiếu nguyenNhan, cachXuLy
        })
        .expect(400);

      expect(JSON.stringify(res.body.thongBao)).toContain('nguyenNhan');
    });

    it('vai support KHÔNG tạo được cây', async () => {
      await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ ...CAY_HOP_LE, ma: 'khong-duoc-tao' })
        .expect(403);
    });

    it('vai content tạo được cây', async () => {
      await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenContent}`)
        .send({ ...CAY_HOP_LE, ma: 'content-tao-duoc' })
        .expect(201);
    });
  });

  // ============================================================
  describe('Cập nhật — PATCH /cay-trong/:ma', () => {
    it('sửa được một phần, không cần gửi đủ mọi trường', async () => {
      const res = await http
        .patch('/api/v1/cay-trong/trau-ba')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ moTaNgan: 'Dây leo dễ sống nhất cho người mới.' })
        .expect(200);

      expect(res.body.duLieu.moTaNgan).toBe('Dây leo dễ sống nhất cho người mới.');
      expect(res.body.duLieu.tenVi).toBe('Trầu bà'); // trường khác không đổi
    });

    it('gửi kèm "ma" trong thân yêu cầu thì mã vẫn không đổi', async () => {
      const res = await http
        .patch('/api/v1/cay-trong/trau-ba')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ma: 'ma-moi-co-tinh', tenVi: 'Trầu bà (đã sửa)' })
        .expect(200);

      expect(res.body.duLieu.ma).toBe('trau-ba');
      expect(res.body.duLieu.tenVi).toBe('Trầu bà (đã sửa)');
    });

    it('từ chối enum sai trong lúc cập nhật', async () => {
      await http
        .patch('/api/v1/cay-trong/trau-ba')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ doAm: 'siêu ẩm' })
        .expect(400);
    });

    it('404 khi sửa mã không tồn tại', async () => {
      await http
        .patch('/api/v1/cay-trong/khong-ton-tai-dau')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ moTaNgan: 'x' })
        .expect(404);
    });

    it('vai support KHÔNG sửa được', async () => {
      await http
        .patch('/api/v1/cay-trong/trau-ba')
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ moTaNgan: 'thử sửa' })
        .expect(403);
    });

    it('ghi lại nhật ký thao tác sửa', async () => {
      // Tự làm một lượt PATCH riêng với giá trị duy nhất, không dựa vào các
      // test trước — nhật ký sắp xếp mới nhất lên đầu nên .find() lấy đúng
      // bản ghi của chính lượt PATCH này.
      const danhDauRieng = 'Đánh dấu riêng cho test nhật ký';
      await http
        .patch('/api/v1/cay-trong/trau-ba')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ moTaNgan: danhDauRieng })
        .expect(200);

      const res = await http
        .get('/api/v1/nhat-ky?doiTuong=cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      const banGhiSua = res.body.duLieu.muc.find(
        (b: { hanhDong: string; maDoiTuong: string; sauKhi: Record<string, unknown> }) =>
          b.hanhDong === 'sửa loài cây' &&
          b.maDoiTuong === 'trau-ba' &&
          b.sauKhi?.moTaNgan === danhDauRieng,
      );
      expect(banGhiSua).toBeDefined();
      expect(banGhiSua.email).toBe('admin-plants@chamxanh.vn');
      expect(banGhiSua.truocKhi).toHaveProperty('moTaNgan');
    });
  });

  // ============================================================
  describe('Toàn vẹn dữ liệu qua vòng đời tạo → đọc → sửa → đọc', () => {
    it('cây tạo qua API đọc lại đúng như đã gửi', async () => {
      const payload = {
        ...CAY_HOP_LE,
        ma: 'vong-doi-day-du',
        tenEn: 'Full Lifecycle Plant',
        congDung: ['trang trí', 'lọc không khí'],
        menhPhongThuy: 'Mộc',
        trongXenDuocVoi: ['trau-ba'],
      };

      await http
        .post('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send(payload)
        .expect(201);

      const doc = await http
        .get('/api/v1/cay-trong/vong-doi-day-du')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(doc.body.duLieu).toMatchObject({
        tenEn: 'Full Lifecycle Plant',
        congDung: ['trang trí', 'lọc không khí'],
        menhPhongThuy: 'Mộc',
        trongXenDuocVoi: ['trau-ba'],
      });
    });
  });
});
