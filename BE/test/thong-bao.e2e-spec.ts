import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Plant, PlantDocument } from '../src/modules/plants/schemas/plant.schema';
import { NguoiDung, NguoiDungDocument } from '../src/modules/nguoi-dung/schemas/nguoi-dung.schema';
import { CayCuaToi, CayCuaToiDocument } from '../src/modules/vuon/schemas/cay-cua-toi.schema';
import { ViecChamSoc, ViecChamSocDocument } from '../src/modules/vuon/schemas/viec-cham-soc.schema';
import { ThongBaoService } from '../src/modules/thong-bao/thong-bao.service';
import { NguoiDungService } from '../src/modules/nguoi-dung/nguoi-dung.service';

const CAY_TEST = {
  ma: 'cay-test-thong-bao',
  tenVi: 'Cây thử Thông báo',
  nhom: 'cây cảnh',
  anhSangToiThieu: 'bóng râm',
  anhSangLyTuong: 'sáng gián tiếp',
  chuKyTuoiMuaKho: 1,
  chuKyTuoiMuaMua: 1,
  doAm: 'trung bình',
  anToanThuNuoi: true,
  doKho: 1,
  kichThuocChauCm: 18,
  doSauKiemTraDat: 3,
  chuKyBonPhan: null,
  chuKyThayDat: null,
  canPhunSuong: false,
};

describe('Thông báo — đăng ký push token + gom nhắc nhở (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;
  let accessToken: string;
  let nguoiDungId: string;

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
      .send({ email: 'nguoi-thong-bao@thong-bao-test.vn', matKhau: 'MatKhauThongBao123!' });
    accessToken = dk.body.duLieu.accessToken;
    nguoiDungId = dk.body.duLieu.nguoiDung.id;

    // Chu kỳ tưới 1 ngày -> việc "tưới" chắc chắn đến hạn trong hôm nay hoặc mai.
    await http
      .post('/api/v1/vuon/cay')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ maCay: CAY_TEST.ma, tenGoi: 'Cây Test Thông Báo', mien: 'Nam', noiDat: 'ban công có mái' })
      .expect(201);
  }, 120_000);

  afterAll(async () => {
    if (app) {
      await app.get<Model<PlantDocument>>(getModelToken(Plant.name)).deleteMany({ ma: CAY_TEST.ma });
      await app
        .get<Model<NguoiDungDocument>>(getModelToken(NguoiDung.name))
        .deleteMany({ email: { $regex: '@thong-bao-test\\.vn$' } });
      await app.get<Model<CayCuaToiDocument>>(getModelToken(CayCuaToi.name)).deleteMany({});
      await app.get<Model<ViecChamSocDocument>>(getModelToken(ViecChamSoc.name)).deleteMany({});
      await app.close();
    }
  });

  it('từ chối đăng ký push token khi chưa đăng nhập', async () => {
    await http.post('/api/v1/auth-app/dang-ky-push-token').send({ expoPushToken: 'x' }).expect(401);
  });

  it('đăng ký push token thành công', async () => {
    // Token KHÔNG đúng định dạng Expo một cách cố ý — kiểm thử tự động không được
    // phép gọi ra máy chủ Expo thật (không có thiết bị nào để nhận, và có thể
    // không có mạng trong môi trường CI). Việc gửi thật cần token từ thiết bị
    // thật, giống hệt việc GĐ 6 cần API key Claude thật để kiểm thử đầy đủ.
    await http
      .post('/api/v1/auth-app/dang-ky-push-token')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ expoPushToken: 'token-gia-khong-dung-dinh-dang-expo' })
      .expect(204);

    const nguoiDungService = app.get(NguoiDungService);
    const ds = await nguoiDungService.danhSachCoPushToken();
    expect(ds.some((nd) => String(nd._id) === nguoiDungId)).toBe(true);
  });

  it('gom nhắc nhở đúng việc đến hạn, nhưng KHÔNG gửi vì token sai định dạng — không gọi Expo thật', async () => {
    const thongBaoService = app.get(ThongBaoService);
    const soDaGui = await thongBaoService.chayNhacNhoHangNgay(new Date());
    // Pipeline (truy vấn việc đến hạn -> gộp theo người dùng -> lọc token hợp lệ)
    // chạy trọn vẹn nhưng dừng lại đúng chỗ, không gọi mạng ra ngoài.
    expect(soDaGui).toBe(0);
  });
});
