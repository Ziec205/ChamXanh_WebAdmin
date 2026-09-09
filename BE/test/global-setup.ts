import { MongoMemoryServer } from 'mongodb-memory-server';

/**
 * Chạy TRƯỚC khi bất kỳ tệp kiểm thử nào được nạp.
 * Bắt buộc phải ở đây vì validateEnv chạy ngay lúc import app.module,
 * sớm hơn cả beforeAll.
 */
export default async function () {
  const mongod = await MongoMemoryServer.create();
  (globalThis as any).__MONGOD__ = mongod;

  process.env.NODE_ENV = 'test';
  process.env.PORT = '3999';
  process.env.CORS_ORIGINS = 'http://localhost:3000';
  process.env.MONGODB_URI = mongod.getUri('chamxanh_test');
  process.env.JWT_ACCESS_SECRET = 'khoa_truy_cap_danh_rieng_cho_kiem_thu_1234567890';
  process.env.JWT_REFRESH_SECRET = 'khoa_lam_moi_KHAC_danh_rieng_cho_kiem_thu_0987654321';
  process.env.JWT_ACCESS_TTL = '15m';
  process.env.JWT_REFRESH_TTL = '30d';
}
