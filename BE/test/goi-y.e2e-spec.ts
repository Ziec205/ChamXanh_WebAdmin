import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Plant, PlantDocument } from '../src/modules/plants/schemas/plant.schema';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AdminRole } from '../src/modules/admin-users/schemas/admin-user.schema';
import { KhaoSatService } from '../src/modules/khao-sat/khao-sat.service';

const MAT_KHAU = 'MatKhauManh!2026';

/** Ba loài đủ để phân biệt mọi nhánh của thuật toán. */
const CAY_MAU = [
  {
    ma: 'luoi-ho',
    tenVi: 'Lưỡi hổ',
    nhom: 'cây cảnh',
    anhSangToiThieu: 'bóng râm',
    anhSangLyTuong: 'sáng gián tiếp',
    chuKyTuoiMuaKho: 14,
    chuKyTuoiMuaMua: 21,
    doAm: 'thấp',
    anToanThuNuoi: false,
    doKho: 1,
    kichThuocChauCm: 20,
    congDung: ['lọc không khí', 'trang trí', 'phong thuỷ'],
    menhPhongThuy: 'Thổ',
    daKiemChung: false,
  },
  {
    ma: 'cau-tieu-tram',
    tenVi: 'Cau tiểu trâm',
    nhom: 'cây cảnh',
    anhSangToiThieu: 'bóng râm',
    anhSangLyTuong: 'sáng gián tiếp',
    chuKyTuoiMuaKho: 5,
    chuKyTuoiMuaMua: 7,
    doAm: 'cao',
    anToanThuNuoi: true,
    doKho: 2,
    kichThuocChauCm: 20,
    congDung: ['lọc không khí', 'trang trí'],
    menhPhongThuy: 'Mộc',
    canPhunSuong: true,
    daKiemChung: true,
  },
  {
    ma: 'ca-chua-bi',
    tenVi: 'Cà chua bi',
    nhom: 'cây ăn quả mini',
    anhSangToiThieu: 'nắng trực tiếp',
    anhSangLyTuong: 'nắng trực tiếp',
    chuKyTuoiMuaKho: 2,
    chuKyTuoiMuaMua: 2,
    doAm: 'trung bình',
    anToanThuNuoi: false,
    doKho: 4,
    kichThuocChauCm: 30,
    congDung: ['ăn được'],
    menhPhongThuy: null,
    ngayThuHoach: 75,
    daKiemChung: false,
  },
];

const KHAO_SAT_CO_BAN = {
  noiDat: 'gần cửa sổ',
  huong: 'Nam',
  dienTich: '3-10m²',
  kinhNghiem: 'đã trồng vài cây',
  thoiGianRanh: '15-30 phút mỗi ngày',
  coThuNuoi: false,
  mien: 'Nam',
};

describe('Cây trồng, khảo sát và gợi ý (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let tokenAdmin: string;
  let tokenSupport: string;

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
      email: 'admin-goiy@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Quản trị',
      vaiTro: AdminRole.Admin,
    });
    await nguoiDung.taoMoi({
      email: 'support-goiy@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Hỗ trợ',
      vaiTro: AdminRole.Support,
    });

    const dangNhap = async (email: string) => {
      const res = await http.post('/api/v1/auth/dang-nhap').send({ email, matKhau: MAT_KHAU });
      return res.body.duLieu.accessToken as string;
    };
    tokenAdmin = await dangNhap('admin-goiy@chamxanh.vn');
    tokenSupport = await dangNhap('support-goiy@chamxanh.vn');

    const model = app.get<Model<PlantDocument>>(getModelToken(Plant.name));
    await model.insertMany(CAY_MAU);

    await app.get(KhaoSatService).napMacDinh();
  }, 120_000);

  afterAll(async () => {
    await app?.close();
  });

  // ============================================================
  describe('Danh mục cây trồng', () => {
    it('liệt kê được cây kèm thông tin phân trang', async () => {
      const res = await http
        .get('/api/v1/cay-trong')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.duLieu.tong).toBe(3);
      expect(res.body.duLieu.muc).toHaveLength(3);
      expect(res.body.duLieu.soTrang).toBe(1);
    });

    it('lọc theo trạng thái kiểm chứng', async () => {
      const res = await http
        .get('/api/v1/cay-trong?daKiemChung=false')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.duLieu.tong).toBe(2);
    });

    it('tìm theo tên tiếng Việt, không phân biệt hoa thường', async () => {
      const res = await http
        .get('/api/v1/cay-trong?tim=lưỡi')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.duLieu.muc[0].ma).toBe('luoi-ho');
    });

    it('trả về số liệu tổng quan cho bảng điều khiển', async () => {
      const res = await http
        .get('/api/v1/cay-trong/thong-ke')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.duLieu).toMatchObject({ tong: 3, daKiemChung: 1, anToanThuNuoi: 1 });
    });

    it('báo lỗi rõ ràng khi tra mã không tồn tại', async () => {
      const res = await http
        .get('/api/v1/cay-trong/khong-co-loai-nay')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(404);

      expect(res.body.thongBao).toContain('khong-co-loai-nay');
    });

    it('vai support KHÔNG được sửa dữ liệu cây', async () => {
      await http
        .patch('/api/v1/cay-trong/luoi-ho')
        .set('Authorization', `Bearer ${tokenSupport}`)
        .send({ tenVi: 'Đổi lung tung' })
        .expect(403);
    });

    it('vai admin sửa được', async () => {
      const res = await http
        .patch('/api/v1/cay-trong/luoi-ho')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ daKiemChung: true })
        .expect(200);

      expect(res.body.duLieu.daKiemChung).toBe(true);

      // Trả lại trạng thái cũ để không ảnh hưởng test khác.
      await http
        .patch('/api/v1/cay-trong/luoi-ho')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ daKiemChung: false });
    });
  });

  // ============================================================
  describe('Bộ câu hỏi khảo sát', () => {
    it('nạp đủ chín câu hỏi mặc định', async () => {
      const res = await http
        .get('/api/v1/khao-sat/cau-hoi')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(200);

      expect(res.body.duLieu).toHaveLength(9);
      expect(res.body.duLieu[0].khoa).toBe('noiDat');
    });

    it('câu hỏi xếp đúng thứ tự', async () => {
      const res = await http
        .get('/api/v1/khao-sat/cau-hoi')
        .set('Authorization', `Bearer ${tokenAdmin}`);

      const thuTu = res.body.duLieu.map((c: { thuTu: number }) => c.thuTu);
      expect([...thuTu].sort((a: number, b: number) => a - b)).toEqual(thuTu);
    });

    it('nạp lại lần hai không tạo bản trùng', async () => {
      const res = await http
        .post('/api/v1/khao-sat/cau-hoi/nap-mac-dinh')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .expect(201);

      expect(res.body.duLieu.themMoi).toBe(0);
      expect(res.body.duLieu.boQua).toBe(9);
    });

    it('không cho đổi khoá kỹ thuật qua đường cập nhật', async () => {
      await http
        .patch('/api/v1/khao-sat/cau-hoi/noiDat')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ khoa: 'khoa-moi', cauHoi: 'Câu hỏi đã sửa' })
        .expect(200);

      // Khoá cũ vẫn phải còn — nếu đổi được thì thuật toán gợi ý sẽ đứt.
      const res = await http
        .get('/api/v1/khao-sat/cau-hoi')
        .set('Authorization', `Bearer ${tokenAdmin}`);
      const khoa = res.body.duLieu.map((c: { khoa: string }) => c.khoa);

      expect(khoa).toContain('noiDat');
      expect(khoa).not.toContain('khoa-moi');
    });
  });

  // ============================================================
  describe('Gợi ý cây trên dữ liệu thật', () => {
    const xinGoiY = (ghiDe: Record<string, unknown> = {}) =>
      http
        .post('/api/v1/goi-y')
        .set('Authorization', `Bearer ${tokenAdmin}`)
        .send({ ...KHAO_SAT_CO_BAN, ...ghiDe });

    it('trả về gợi ý kèm câu giải thích', async () => {
      const res = await xinGoiY().expect(201);

      expect(res.body.duLieu.goiY.length).toBeGreaterThan(0);
      expect(res.body.duLieu.goiY[0].giaiThich).toEqual(expect.any(String));
      expect(res.body.duLieu.tongSoLoaiXet).toBe(3);
    });

    it('cho biết mức sáng đã suy ra từ vị trí và hướng', async () => {
      const res = await xinGoiY({ noiDat: 'ban công trống', huong: 'Tây' });
      expect(res.body.duLieu.anhSangCoSan).toBe('nắng trực tiếp');
    });

    it('nhà có mèo thì loại hết cây độc, kèm lý do', async () => {
      const res = await xinGoiY({ coThuNuoi: true });

      const maGoiY = res.body.duLieu.goiY.map((g: { ma: string }) => g.ma);
      expect(maGoiY).not.toContain('luoi-ho');
      expect(maGoiY).not.toContain('ca-chua-bi');

      const biLoai = res.body.duLieu.biLoai;
      expect(biLoai.find((b: { ma: string }) => b.ma === 'luoi-ho').lyDoLoai).toBe(
        'độc với thú nuôi',
      );
    });

    it('chỗ tối thì loại cây cần nắng trực tiếp', async () => {
      const res = await xinGoiY({ noiDat: 'trong nhà thiếu sáng', huong: 'Bắc' });

      const biLoai = res.body.duLieu.biLoai;
      expect(biLoai.find((b: { ma: string }) => b.ma === 'ca-chua-bi').lyDoLoai).toBe('thiếu sáng');
    });

    it('người bận được gợi ý cây tưới thưa lên đầu', async () => {
      const res = await xinGoiY({ thoiGianRanh: 'gần như không có' });
      expect(res.body.duLieu.goiY[0].ma).toBe('luoi-ho');
    });

    it('mọi loài đều được phân loại, không loài nào biến mất', async () => {
      const res = await xinGoiY({ soLuong: 20 });
      const { goiY, biLoai } = res.body.duLieu;
      expect(goiY.length + biLoai.length).toBe(3);
    });

    it('từ chối câu trả lời không hợp lệ, nêu rõ trường sai', async () => {
      const res = await xinGoiY({ noiDat: 'trên mặt trăng' }).expect(400);
      expect(JSON.stringify(res.body.thongBao)).toContain('noiDat');
    });

    // Từng lọt lưới: dùng @IsEnum() với mảng `as const` vẫn chặn đúng giá trị sai
    // nhưng in thông báo rỗng ("must be one of the following values: "), nên app
    // và Swagger không bao giờ biết giá trị nào hợp lệ. Phải là @IsIn().
    it('thông báo lỗi LIỆT KÊ ra các giá trị hợp lệ, không bỏ trống', async () => {
      const res = await xinGoiY({ noiDat: 'trên mặt trăng' }).expect(400);
      const thongBao = (res.body.thongBao as string[]).find((t) => t.includes('noiDat'))!;
      expect(thongBao).toContain('ban công có mái');
      expect(thongBao).not.toMatch(/values:\s*$/);
    });

    it('từ chối trường lạ thay vì âm thầm bỏ qua', async () => {
      await xinGoiY({ truongKhongTonTai: 'abc' }).expect(400);
    });
  });
});
