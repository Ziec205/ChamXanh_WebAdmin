import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Plant, PlantDocument } from '../src/modules/plants/schemas/plant.schema';
import { SanPham, SanPhamDocument } from '../src/modules/san-pham/schemas/san-pham.schema';
import { NguoiDung, NguoiDungDocument } from '../src/modules/nguoi-dung/schemas/nguoi-dung.schema';
import { CayCuaToi, CayCuaToiDocument } from '../src/modules/vuon/schemas/cay-cua-toi.schema';
import { ViecChamSoc, ViecChamSocDocument } from '../src/modules/vuon/schemas/viec-cham-soc.schema';
import { MucGioCho, MucGioChoDocument } from '../src/modules/gio-cho-cham-soc/schemas/muc-gio-cho.schema';

const CAY_TEST = {
  ma: 'cay-test-gio-cho',
  tenVi: 'Cây thử Giỏ Chờ',
  nhom: 'cây cảnh',
  anhSangToiThieu: 'bóng râm',
  anhSangLyTuong: 'sáng gián tiếp',
  chuKyTuoiMuaKho: 30,
  chuKyTuoiMuaMua: 30,
  doAm: 'trung bình',
  anToanThuNuoi: true,
  doKho: 1,
  kichThuocChauCm: 18,
  doSauKiemTraDat: 3,
  chuKyBonPhan: 3,
  chuKyThayDat: null,
  canPhunSuong: false,
};

describe('Giỏ Chờ Chăm Sóc — /gio-cho-cham-soc (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let accessToken: string;
  let sanPhamId: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    http = request(app.getHttpServer());

    await app.get<Model<PlantDocument>>(getModelToken(Plant.name)).create(CAY_TEST);
    const sp = await app.get<Model<SanPhamDocument>>(getModelToken(SanPham.name)).create({
      ten: 'Phân bón thử nghiệm',
      nhom: 'phan',
      gia: 30000,
      tonKho: 50,
      dangBan: true,
    });
    sanPhamId = String(sp._id);

    const dk = await http
      .post('/api/v1/auth-app/dang-ky')
      .send({ email: 'nguoi-gio-cho@gio-cho-test.vn', matKhau: 'MatKhauGioCho123!' });
    accessToken = dk.body.duLieu.accessToken;

    await http
      .post('/api/v1/vuon/cay')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maCay: CAY_TEST.ma, tenGoi: 'Cây thử Giỏ Chờ', mien: 'Nam', noiDat: 'ban công có mái' })
      .expect(201);
  }, 120_000);

  afterAll(async () => {
    if (app) {
      await app.get<Model<PlantDocument>>(getModelToken(Plant.name)).deleteMany({ ma: CAY_TEST.ma });
      await app.get<Model<SanPhamDocument>>(getModelToken(SanPham.name)).deleteMany({ _id: sanPhamId });
      await app
        .get<Model<NguoiDungDocument>>(getModelToken(NguoiDung.name))
        .deleteMany({ email: { $regex: '@gio-cho-test\\.vn$' } });
      await app.get<Model<CayCuaToiDocument>>(getModelToken(CayCuaToi.name)).deleteMany({});
      await app.get<Model<ViecChamSocDocument>>(getModelToken(ViecChamSoc.name)).deleteMany({});
      await app.get<Model<MucGioChoDocument>>(getModelToken(MucGioCho.name)).deleteMany({});
      await app.close();
    }
  });

  it('từ chối khi chưa đăng nhập', async () => {
    await http.get('/api/v1/gio-cho-cham-soc').expect(401);
  });

  it('gợi ý vật tư dựa trên việc "bón phân" sắp tới (trong 3 ngày)', async () => {
    const res = await http
      .get('/api/v1/gio-cho-cham-soc/goi-y')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.duLieu.length).toBeGreaterThan(0);
    expect(res.body.duLieu[0].sanPhamId).toBe(sanPhamId);
    expect(res.body.duLieu[0].lyDo).toContain('bón phân');
  });

  let mucId: string;

  it('thêm vào giỏ từ gợi ý', async () => {
    const res = await http
      .post('/api/v1/gio-cho-cham-soc')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ sanPhamId, lyDo: 'Cây thử cần bón phân trong 3 ngày', soLuong: 2 })
      .expect(201);
    mucId = res.body.duLieu._id;
    expect(res.body.duLieu.daMua).toBe(false);
  });

  it('liệt kê thấy mục vừa thêm, đã populate tên sản phẩm', async () => {
    const res = await http
      .get('/api/v1/gio-cho-cham-soc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const muc = res.body.duLieu.find((m: { _id: string }) => m._id === mucId);
    expect(muc).toBeTruthy();
    expect(muc.sanPhamId.ten).toBe('Phân bón thử nghiệm');
  });

  it('người khác không thấy/xoá được mục của người này', async () => {
    const dk2 = await http
      .post('/api/v1/auth-app/dang-ky')
      .send({ email: 'nguoi-khac-gio-cho@gio-cho-test.vn', matKhau: 'MatKhauKhac123!' });
    const res = await http
      .get('/api/v1/gio-cho-cham-soc')
      .set('Authorization', `Bearer ${dk2.body.duLieu.accessToken}`)
      .expect(200);
    expect(res.body.duLieu.length).toBe(0);

    await http
      .delete(`/api/v1/gio-cho-cham-soc/${mucId}`)
      .set('Authorization', `Bearer ${dk2.body.duLieu.accessToken}`)
      .expect(404);
  });

  it('đánh dấu đã mua', async () => {
    const res = await http
      .patch(`/api/v1/gio-cho-cham-soc/${mucId}/danh-dau-da-mua`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.duLieu.daMua).toBe(true);
  });

  it('xoá khỏi giỏ', async () => {
    await http
      .delete(`/api/v1/gio-cho-cham-soc/${mucId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const res = await http
      .get('/api/v1/gio-cho-cham-soc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.duLieu.length).toBe(0);
  });
});
