import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Plant, PlantDocument } from '../src/modules/plants/schemas/plant.schema';
import { NguoiDung, NguoiDungDocument } from '../src/modules/nguoi-dung/schemas/nguoi-dung.schema';
import { CayCuaToi, CayCuaToiDocument } from '../src/modules/vuon/schemas/cay-cua-toi.schema';
import {
  ViecChamSoc,
  ViecChamSocDocument,
} from '../src/modules/vuon/schemas/viec-cham-soc.schema';

const CAY_TEST = {
  ma: 'cay-test-vuon',
  tenVi: 'Cây thử nghiệm Vườn',
  nhom: 'cây cảnh',
  anhSangToiThieu: 'bóng râm',
  anhSangLyTuong: 'sáng gián tiếp',
  chuKyTuoiMuaKho: 7,
  chuKyTuoiMuaMua: 10,
  doAm: 'trung bình',
  anToanThuNuoi: true,
  doKho: 1,
  kichThuocChauCm: 18,
  doSauKiemTraDat: 3,
  chuKyBonPhan: 30,
  chuKyThayDat: 12,
  canPhunSuong: true,
};

describe('Vườn của tôi — /vuon (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let accessToken: string;

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

    const dk = await http
      .post('/api/v1/auth-app/dang-ky')
      .send({ email: 'nguoi-lam-vuon@vuon-test.vn', matKhau: 'MatKhauVuon123!', hoTen: 'Người Làm Vườn' });
    accessToken = dk.body.duLieu.accessToken;
  }, 120_000);

  afterAll(async () => {
    if (app) {
      await app.get<Model<PlantDocument>>(getModelToken(Plant.name)).deleteMany({ ma: CAY_TEST.ma });
      await app
        .get<Model<NguoiDungDocument>>(getModelToken(NguoiDung.name))
        .deleteMany({ email: { $regex: '@vuon-test\\.vn$' } });
      await app.get<Model<CayCuaToiDocument>>(getModelToken(CayCuaToi.name)).deleteMany({});
      await app.get<Model<ViecChamSocDocument>>(getModelToken(ViecChamSoc.name)).deleteMany({});
      await app.close();
    }
  });

  it('từ chối khi chưa đăng nhập', async () => {
    await http.get('/api/v1/vuon/cay').expect(401);
  });

  it('từ chối thêm cây với mã không tồn tại', async () => {
    await http
      .post('/api/v1/vuon/cay')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maCay: 'khong-ton-tai', mien: 'Nam', noiDat: 'ban công có mái' })
      .expect(404);
  });

  it('từ chối miền/nơi đặt không hợp lệ', async () => {
    await http
      .post('/api/v1/vuon/cay')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maCay: CAY_TEST.ma, mien: 'Tây', noiDat: 'ban công có mái' })
      .expect(400);
  });

  let cayId: string;

  it('thêm cây thành công, tự sinh đủ 4 loại việc (cây test có đủ điều kiện)', async () => {
    const res = await http
      .post('/api/v1/vuon/cay')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maCay: CAY_TEST.ma, tenGoi: 'Bé Test', mien: 'Nam', noiDat: 'ban công có mái' })
      .expect(201);
    cayId = res.body.duLieu._id;
    expect(res.body.duLieu.tenGoi).toBe('Bé Test');

    const viec = await http
      .get('/api/v1/vuon/viec-cham-soc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const loaiViec = viec.body.duLieu.map((v: { loai: string }) => v.loai).sort();
    expect(loaiViec).toEqual(['bón phân', 'phun sương', 'thay đất', 'tưới'].sort());
  });

  it('liệt kê thấy cây vừa thêm', async () => {
    const res = await http
      .get('/api/v1/vuon/cay')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.duLieu.some((c: { _id: string }) => c._id === cayId)).toBe(true);
  });

  it('chi tiết cây của người khác bị từ chối bằng 404, không phải 403 (không tiết lộ tồn tại)', async () => {
    const dk2 = await http
      .post('/api/v1/auth-app/dang-ky')
      .send({ email: 'nguoi-khac@vuon-test.vn', matKhau: 'MatKhauKhac123!' });
    await http
      .get(`/api/v1/vuon/cay/${cayId}`)
      .set('Authorization', `Bearer ${dk2.body.duLieu.accessToken}`)
      .expect(404);
  });

  it('hoàn thành một việc chăm sóc — dời hạn tiếp theo, ghi nhận thời điểm', async () => {
    const dsViec = await http
      .get('/api/v1/vuon/viec-cham-soc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    const viecTuoi = dsViec.body.duLieu.find((v: { loai: string }) => v.loai === 'tưới');
    const hanCu = new Date(viecTuoi.hanKeTiep).getTime();

    const res = await http
      .patch(`/api/v1/vuon/viec-cham-soc/${viecTuoi._id}/hoan-thanh`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(res.body.duLieu.hoanThanhLanCuoi).toBeTruthy();
    expect(new Date(res.body.duLieu.hanKeTiep).getTime()).toBeGreaterThan(hanCu - 1000 * 60 * 60 * 24 * 30);
    // Hạn mới phải tính từ HÔM NAY, không phải từ hạn cũ.
    const hanMoiKyVong = Date.now() + viecTuoi.chuKyNgay * 24 * 60 * 60 * 1000;
    expect(Math.abs(new Date(res.body.duLieu.hanKeTiep).getTime() - hanMoiKyVong)).toBeLessThan(5000);
  });

  it('404 khi hoàn thành việc không tồn tại', async () => {
    await http
      .patch('/api/v1/vuon/viec-cham-soc/000000000000000000000000/hoan-thanh')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(404);
  });

  it('xoá cây — xoá luôn toàn bộ việc chăm sóc của cây đó', async () => {
    await http
      .delete(`/api/v1/vuon/cay/${cayId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const viec = await http
      .get('/api/v1/vuon/viec-cham-soc')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(viec.body.duLieu.length).toBe(0);
  });
});
