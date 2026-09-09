import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { CauHoi, CauHoiDocument } from '../src/modules/khao-sat/schemas/cau-hoi.schema';
import { AdminUsersService } from '../src/modules/admin-users/admin-users.service';
import { AdminRole } from '../src/modules/admin-users/schemas/admin-user.schema';

const MAT_KHAU = 'MatKhauManh!2026';

describe('DTO câu hỏi khảo sát — cập nhật (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let tokenAdmin: string;
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
      email: 'admin-khaosat@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Quản trị',
      vaiTro: AdminRole.Admin,
    });
    await nguoiDung.taoMoi({
      email: 'support-khaosat@chamxanh.vn',
      matKhau: MAT_KHAU,
      hoTen: 'Hỗ trợ',
      vaiTro: AdminRole.Support,
    });
    tokenAdmin = await dangNhap('admin-khaosat@chamxanh.vn');
    tokenSupport = await dangNhap('support-khaosat@chamxanh.vn');

    // Câu hỏi thử nghiệm riêng — không đụng 9 câu mặc định để không ảnh hưởng
    // tới các test khác trong cùng lượt chạy (goi-y.e2e-spec.ts đếm đúng 9 câu).
    const model = app.get<Model<CauHoiDocument>>(getModelToken(CauHoi.name));
    await model.create({
      khoa: 'cau-hoi-thu-nghiem',
      thuTu: 999,
      cauHoi: 'Câu hỏi dùng để kiểm thử',
      dapAn: [{ giaTri: 'a', nhan: 'Lựa chọn A' }],
      dangHienThi: true,
    });
  }, 120_000);

  afterAll(async () => {
    if (app) {
      const model = app.get<Model<CauHoiDocument>>(getModelToken(CauHoi.name));
      await model.deleteOne({ khoa: 'cau-hoi-thu-nghiem' });
      await app.close();
    }
  });

  it('sửa được thứ tự và nội dung', async () => {
    const res = await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ thuTu: 5, cauHoi: 'Nội dung đã sửa' })
      .expect(200);

    expect(res.body.duLieu.thuTu).toBe(5);
    expect(res.body.duLieu.cauHoi).toBe('Nội dung đã sửa');
  });

  it('gửi kèm "khoa" trong thân yêu cầu thì khoá vẫn không đổi', async () => {
    const res = await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ khoa: 'khoa-gia-mao', cauHoi: 'Vẫn phải đổi được nội dung' })
      .expect(200);

    expect(res.body.duLieu.khoa).toBe('cau-hoi-thu-nghiem');
    expect(res.body.duLieu.cauHoi).toBe('Vẫn phải đổi được nội dung');
  });

  it('sửa được mảng đáp án hợp lệ', async () => {
    const res = await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        dapAn: [
          { giaTri: 'a', nhan: 'Lựa chọn A đã sửa', moTa: 'Ghi chú thêm' },
          { giaTri: 'b', nhan: 'Lựa chọn B mới' },
        ],
      })
      .expect(200);

    expect(res.body.duLieu.dapAn).toHaveLength(2);
    expect(res.body.duLieu.dapAn[1].nhan).toBe('Lựa chọn B mới');
  });

  it('từ chối đáp án thiếu trường "nhan"', async () => {
    const res = await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ dapAn: [{ giaTri: 'a' }] })
      .expect(400);

    expect(JSON.stringify(res.body.thongBao)).toContain('nhan');
  });

  it('từ chối mảng đáp án rỗng', async () => {
    await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ dapAn: [] })
      .expect(400);
  });

  it('từ chối trường lạ', async () => {
    await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ truongKhongTonTai: 'abc' })
      .expect(400);
  });

  it('ẩn được câu hỏi bằng dangHienThi', async () => {
    await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ dangHienThi: false })
      .expect(200);

    const congKhai = await http.get('/api/v1/khao-sat/cau-hoi').set('Authorization', `Bearer ${tokenAdmin}`);
    expect(
      congKhai.body.duLieu.find((c: { khoa: string }) => c.khoa === 'cau-hoi-thu-nghiem'),
    ).toBeUndefined();

    const dayDu = await http
      .get('/api/v1/khao-sat/cau-hoi/tat-ca')
      .set('Authorization', `Bearer ${tokenAdmin}`);
    expect(
      dayDu.body.duLieu.find((c: { khoa: string }) => c.khoa === 'cau-hoi-thu-nghiem'),
    ).toBeDefined();

    // Bật lại để không ảnh hưởng các test sau.
    await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ dangHienThi: true })
      .expect(200);
  });

  it('vai support KHÔNG sửa được', async () => {
    await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenSupport}`)
      .send({ cauHoi: 'thử sửa' })
      .expect(403);
  });

  it('404 khi sửa khoá không tồn tại', async () => {
    await http
      .patch('/api/v1/khao-sat/cau-hoi/khong-ton-tai-dau')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cauHoi: 'x' })
      .expect(404);
  });

  it('ghi lại nhật ký thao tác sửa', async () => {
    const danhDauRieng = 'Đánh dấu riêng cho test nhật ký khảo sát';
    await http
      .patch('/api/v1/khao-sat/cau-hoi/cau-hoi-thu-nghiem')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cauHoi: danhDauRieng })
      .expect(200);

    const res = await http
      .get('/api/v1/nhat-ky?doiTuong=khao-sat')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .expect(200);

    const banGhi = res.body.duLieu.muc.find(
      (b: { hanhDong: string; maDoiTuong: string; sauKhi: Record<string, unknown> }) =>
        b.hanhDong === 'sửa câu hỏi khảo sát' &&
        b.maDoiTuong === 'cau-hoi-thu-nghiem' &&
        b.sauKhi?.cauHoi === danhDauRieng,
    );
    expect(banGhi).toBeDefined();
    expect(banGhi.email).toBe('admin-khaosat@chamxanh.vn');
  });
});
