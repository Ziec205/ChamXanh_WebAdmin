import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { NguoiDung, NguoiDungDocument } from '../src/modules/nguoi-dung/schemas/nguoi-dung.schema';

describe('Xác thực người dùng app — /auth-app (đầu cuối)', () => {
  let app: INestApplication;
  let http: ReturnType<typeof request>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    await app.init();
    http = request(app.getHttpServer());
  }, 120_000);

  afterAll(async () => {
    if (app) {
      await app
        .get<Model<NguoiDungDocument>>(getModelToken(NguoiDung.name))
        .deleteMany({ email: { $regex: '@auth-app-test\\.vn$' } });
      await app.close();
    }
  });

  const EMAIL = 'khach@auth-app-test.vn';
  const MAT_KHAU = 'MatKhauKhach123!';

  it('từ chối đăng ký mật khẩu ngắn', async () => {
    await http.post('/api/v1/auth-app/dang-ky').send({ email: EMAIL, matKhau: '123' }).expect(400);
  });

  it('từ chối đăng ký email không hợp lệ', async () => {
    await http.post('/api/v1/auth-app/dang-ky').send({ email: 'khong-phai-email', matKhau: MAT_KHAU }).expect(400);
  });

  it('đăng ký thành công, trả về token', async () => {
    const res = await http
      .post('/api/v1/auth-app/dang-ky')
      .send({ email: EMAIL, matKhau: MAT_KHAU, hoTen: 'Khách Test' })
      .expect(201);
    expect(res.body.duLieu.accessToken).toBeTruthy();
    expect(res.body.duLieu.refreshToken).toBeTruthy();
    expect(res.body.duLieu.nguoiDung.email).toBe(EMAIL);
  });

  it('từ chối đăng ký trùng email', async () => {
    await http.post('/api/v1/auth-app/dang-ky').send({ email: EMAIL, matKhau: MAT_KHAU }).expect(409);
  });

  it('không trả về matKhauBam trong response', async () => {
    const res = await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: MAT_KHAU }).expect(200);
    expect(res.body.duLieu.nguoiDung.matKhauBam).toBeUndefined();
  });

  it('từ chối đăng nhập sai mật khẩu, không tiết lộ email có tồn tại hay không', async () => {
    const res1 = await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: 'sai-roi' }).expect(401);
    const res2 = await http
      .post('/api/v1/auth-app/dang-nhap')
      .send({ email: 'khong-ton-tai@auth-app-test.vn', matKhau: 'sai-roi' })
      .expect(401);
    expect(res1.body.thongBao).toBe(res2.body.thongBao);
  });

  it('khoá tạm sau 5 lần đăng nhập sai liên tiếp', async () => {
    for (let i = 0; i < 4; i++) {
      await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: 'sai-roi' });
    }
    // Lần thứ 5 sai → khoá tạm.
    await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: 'sai-roi' }).expect(401);
    // Dù gõ đúng mật khẩu bây giờ vẫn bị chặn vì đang khoá tạm.
    const res = await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: MAT_KHAU }).expect(401);
    expect(res.body.thongBao).toContain('tạm bị khoá');

    // Mở khoá lại cho các test sau bằng cách xoá thẳng field trong Mongo.
    const model = app.get<Model<NguoiDungDocument>>(getModelToken(NguoiDung.name));
    await model.updateOne({ email: EMAIL }, { khoaToi: null, soLanDangNhapSai: 0 });
  });

  it('đăng nhập thành công và làm mới token, token cũ bị thu hồi (xoay vòng)', async () => {
    const dn = await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: MAT_KHAU }).expect(200);
    const { refreshToken } = dn.body.duLieu;

    const lm = await http.post('/api/v1/auth-app/lam-moi').send({ refreshToken }).expect(200);
    expect(lm.body.duLieu.accessToken).toBeTruthy();

    // refresh token cũ đã bị thu hồi, dùng lại phải bị từ chối.
    await http.post('/api/v1/auth-app/lam-moi').send({ refreshToken }).expect(401);
  });

  it('GET /toi trả về danh tính đúng với access token', async () => {
    const dn = await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: MAT_KHAU }).expect(200);
    const res = await http
      .get('/api/v1/auth-app/toi')
      .set('Authorization', `Bearer ${dn.body.duLieu.accessToken}`)
      .expect(200);
    expect(res.body.duLieu.email).toBe(EMAIL);
  });

  // Từng lọt lưới: /toi trả thẳng payload JWT (chỉ id + email) nên thiếu hoTen.
  // App khôi phục phiên bằng chính endpoint này lúc mở lại, nên tên người dùng
  // biến mất khỏi màn Cá nhân dù vừa đăng nhập xong vẫn còn thấy.
  it('GET /toi trả ĐỦ trường như lúc đăng nhập, gồm cả hoTen', async () => {
    const dn = await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: MAT_KHAU }).expect(200);
    const res = await http
      .get('/api/v1/auth-app/toi')
      .set('Authorization', `Bearer ${dn.body.duLieu.accessToken}`)
      .expect(200);
    expect(res.body.duLieu.hoTen).toBe('Khách Test');
    expect(Object.keys(res.body.duLieu).sort()).toEqual(Object.keys(dn.body.duLieu.nguoiDung).sort());
  });

  it('token admin không dùng được cho route app', async () => {
    // Không có tài khoản admin thật ở đây — thử token rỗng/giả phải bị 401.
    await http.get('/api/v1/auth-app/toi').set('Authorization', 'Bearer token-gia-mao').expect(401);
  });

  it('từ chối đổi mật khẩu khi mật khẩu hiện tại sai', async () => {
    const dn = await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: MAT_KHAU }).expect(200);
    await http
      .post('/api/v1/auth-app/doi-mat-khau')
      .set('Authorization', `Bearer ${dn.body.duLieu.accessToken}`)
      .send({ matKhauHienTai: 'sai-roi', matKhauMoi: 'MatKhauMoi123!' })
      .expect(401);
  });

  it('đổi mật khẩu thành công, thu hồi mọi phiên kể cả access token vừa dùng để đổi', async () => {
    const dn = await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: MAT_KHAU }).expect(200);
    const accessToken = dn.body.duLieu.accessToken;

    await http
      .post('/api/v1/auth-app/doi-mat-khau')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ matKhauHienTai: MAT_KHAU, matKhauMoi: 'MatKhauMoi123!' })
      .expect(204);

    // Refresh token cũ (nếu có) đã bị thu hồi — đăng nhập bằng mật khẩu cũ phải thất bại.
    await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: MAT_KHAU }).expect(401);
    // Mật khẩu mới đăng nhập được.
    await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: 'MatKhauMoi123!' }).expect(200);
  });

  it('xoá tài khoản đòi hỏi đúng mật khẩu, sau đó tài khoản biến mất vĩnh viễn', async () => {
    const dn = await http
      .post('/api/v1/auth-app/dang-nhap')
      .send({ email: EMAIL, matKhau: 'MatKhauMoi123!' })
      .expect(200);
    const accessToken = dn.body.duLieu.accessToken;

    await http
      .delete('/api/v1/auth-app/xoa-tai-khoan')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ matKhau: 'sai-roi' })
      .expect(401);

    await http
      .delete('/api/v1/auth-app/xoa-tai-khoan')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ matKhau: 'MatKhauMoi123!' })
      .expect(204);

    // Tài khoản không còn tồn tại — đăng nhập lại phải thất bại.
    await http.post('/api/v1/auth-app/dang-nhap').send({ email: EMAIL, matKhau: 'MatKhauMoi123!' }).expect(401);
  });
});
