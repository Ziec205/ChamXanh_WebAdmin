export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3001', 10),
  corsOrigins: (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  mongodbUri: process.env.MONGODB_URI!,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    accessTtl: process.env.JWT_ACCESS_TTL ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshTtl: process.env.JWT_REFRESH_TTL ?? '30d',
  },
  // Khoá riêng cho JWT của người dùng app — tách khỏi khoá Web Admin để một
  // token của bên này không thể lẫn sang bên kia dù cùng thuật toán ký.
  jwtApp: {
    accessSecret: process.env.JWT_APP_ACCESS_SECRET!,
    accessTtl: process.env.JWT_APP_ACCESS_TTL ?? '30m',
    refreshTtl: process.env.JWT_APP_REFRESH_TTL ?? '60d',
  },
});
