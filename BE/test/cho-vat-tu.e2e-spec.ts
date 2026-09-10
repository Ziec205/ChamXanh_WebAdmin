import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SanPham, SanPhamDocument } from '../src/modules/san-pham/schemas/san-pham.schema';
import { NguoiDung, NguoiDungDocument } from '../src/modules/nguoi-dung/schemas/nguoi-dung.schema';
import { GioHang, GioHangDocument } from '../src/modules/gio-hang/schemas/gio-hang.schema';
import { DiaChi, DiaChiDocument } from '../src/modules/dia-chi/schemas/dia-chi.schema';
import { DonHang, DonHangDocument } from '../src/modules/don-hang/schemas/don-hang.schema';

describe('Chợ Vật Tư — giỏ hàng, địa chỉ, đặt đơn (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let accessToken: string;
  let sanPhamId: string;
  let sanPhamItId: string; // sản phẩm chỉ còn 1 tồn kho, dùng để test hết hàng

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    http = request(app.getHttpServer());

    const spModel = app.get<Model<SanPhamDocument>>(getModelToken(SanPham.name));
    const sp = await spModel.create({ ten: 'Đất trồng thử', nhom: 'dat', gia: 45000, tonKho: 10, dangBan: true });
    sanPhamId = String(sp._id);
    const spIt = await spModel.create({ ten: 'Chậu sứ giới hạn', nhom: 'chau', gia: 120000, tonKho: 1, dangBan: true });
    sanPhamItId = String(spIt._id);

    const dk = await http
      .post('/api/v1/auth-app/dang-ky')
      .send({ email: 'khach-cho-vat-tu@cho-test.vn', matKhau: 'MatKhauChoTest123!' });
    accessToken = dk.body.duLieu.accessToken;
  }, 120_000);

  afterAll(async () => {
    if (app) {
      await app.get<Model<SanPhamDocument>>(getModelToken(SanPham.name)).deleteMany({ _id: { $in: [sanPhamId, sanPhamItId] } });
      await app
        .get<Model<NguoiDungDocument>>(getModelToken(NguoiDung.name))
        .deleteMany({ email: { $regex: '@cho-test\\.vn$' } });
      await app.get<Model<GioHangDocument>>(getModelToken(GioHang.name)).deleteMany({});
      await app.get<Model<DiaChiDocument>>(getModelToken(DiaChi.name)).deleteMany({});
      await app.get<Model<DonHangDocument>>(getModelToken(DonHang.name)).deleteMany({});
      await app.close();
    }
  });

  it('từ chối khi chưa đăng nhập', async () => {
    await http.get('/api/v1/gio-hang').expect(401);
    await http.get('/api/v1/dia-chi').expect(401);
  });

  it('giỏ hàng rỗng ban đầu', async () => {
    const res = await http.get('/api/v1/gio-hang').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(res.body.duLieu.mucList).toEqual([]);
  });

  it('thêm sản phẩm vào giỏ, cộng dồn khi thêm lại cùng sản phẩm', async () => {
    await http
      .post('/api/v1/gio-hang')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ sanPhamId, soLuong: 2 })
      .expect(201);
    const res = await http
      .post('/api/v1/gio-hang')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ sanPhamId, soLuong: 1 })
      .expect(201);
    const muc = res.body.duLieu.mucList.find((m: { sanPhamId: { _id: string } }) => m.sanPhamId._id === sanPhamId);
    expect(muc.soLuong).toBe(3);
    expect(muc.sanPhamId.ten).toBe('Đất trồng thử');
  });

  it('sửa số lượng trong giỏ', async () => {
    const res = await http
      .patch(`/api/v1/gio-hang/${sanPhamId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ soLuong: 5 })
      .expect(200);
    const muc = res.body.duLieu.mucList.find((m: { sanPhamId: { _id: string } }) => m.sanPhamId._id === sanPhamId);
    expect(muc.soLuong).toBe(5);
  });

  let diaChiId: string;

  it('thêm địa chỉ giao hàng', async () => {
    const res = await http
      .post('/api/v1/dia-chi')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ hoTen: 'Nguyễn Văn A', soDienThoai: '0900000001', diaChiChiTiet: '12 Đường ABC', tinhThanh: 'TP.HCM', macDinh: true })
      .expect(201);
    diaChiId = res.body.duLieu._id;
    expect(res.body.duLieu.macDinh).toBe(true);
  });

  it('đặt đơn từ chối phương thức MoMo (chưa hỗ trợ)', async () => {
    await http
      .post('/api/v1/don-hang-cua-toi')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ diaChiId, phuongThucThanhToan: 'momo' })
      .expect(400);
  });

  let donHangId: string;

  it('đặt đơn từ giỏ hàng bằng COD, tự tính tiền từ giá server và trừ tồn kho', async () => {
    const res = await http
      .post('/api/v1/don-hang-cua-toi')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ diaChiId, phuongThucThanhToan: 'cod' })
      .expect(201);
    donHangId = res.body.duLieu._id;
    expect(res.body.duLieu.tongTien).toBe(45000 * 5);
    expect(res.body.duLieu.trangThai).toBe('cho-xac-nhan');
    expect(res.body.duLieu.diaChiGiao.hoTen).toBe('Nguyễn Văn A');

    const sp = await http.get(`/api/v1/cay-trong`).expect(200); // sanity — endpoint bất kỳ vẫn sống
    expect(sp.body.thanhCong).toBe(true);

    const spModel = app.get<Model<SanPhamDocument>>(getModelToken(SanPham.name));
    const spSauKhiMua = await spModel.findById(sanPhamId).exec();
    expect(spSauKhiMua!.tonKho).toBe(5); // 10 - 5
  });

  it('giỏ hàng đã trống sau khi đặt đơn thành công', async () => {
    const res = await http.get('/api/v1/gio-hang').set('Authorization', `Bearer ${accessToken}`).expect(200);
    expect(res.body.duLieu.mucList).toEqual([]);
  });

  it('thấy đơn vừa đặt trong danh sách đơn của tôi', async () => {
    const res = await http
      .get('/api/v1/don-hang-cua-toi')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.duLieu.find((d: { _id: string }) => d._id === donHangId)).toBeTruthy();
  });

  it('người khác không xem được đơn hàng của người này', async () => {
    const dk2 = await http
      .post('/api/v1/auth-app/dang-ky')
      .send({ email: 'khach-khac-cho-vat-tu@cho-test.vn', matKhau: 'MatKhauKhac123!' });
    await http
      .get(`/api/v1/don-hang-cua-toi/${donHangId}`)
      .set('Authorization', `Bearer ${dk2.body.duLieu.accessToken}`)
      .expect(404);
  });

  it('đặt đơn thất bại khi không đủ tồn kho — không tạo đơn, không trừ kho sai', async () => {
    await http
      .post('/api/v1/gio-hang')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ sanPhamId: sanPhamItId, soLuong: 5 })
      .expect(201);

    await http
      .post('/api/v1/don-hang-cua-toi')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ diaChiId, phuongThucThanhToan: 'cod' })
      .expect(400);

    const spModel = app.get<Model<SanPhamDocument>>(getModelToken(SanPham.name));
    const spSauKhiThatBai = await spModel.findById(sanPhamItId).exec();
    expect(spSauKhiThatBai!.tonKho).toBe(1); // không bị trừ dù thất bại
  });

  it('đặt đơn với địa chỉ mới nhập trực tiếp (không cần lưu trước)', async () => {
    await http
      .patch(`/api/v1/gio-hang/${sanPhamItId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ soLuong: 1 })
      .expect(200);

    const res = await http
      .post('/api/v1/don-hang-cua-toi')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        diaChiMoi: { hoTen: 'Trần Thị B', soDienThoai: '0900000002', diaChiChiTiet: '99 Đường XYZ' },
        phuongThucThanhToan: 'chuyen-khoan',
      })
      .expect(201);
    expect(res.body.duLieu.diaChiGiao.hoTen).toBe('Trần Thị B');
  });
});
