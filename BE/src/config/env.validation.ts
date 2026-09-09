import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, MinLength, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Ứng dụng phải chết ngay lúc khởi động nếu thiếu biến môi trường,
 * thay vì chạy được rồi hỏng giữa chừng ở nơi khó lần ra.
 */
class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV!: Environment;

  @IsNumber()
  PORT!: number;

  @IsString()
  CORS_ORIGINS!: string;

  @IsString()
  @MinLength(20, { message: 'MONGODB_URI trông không giống một chuỗi kết nối hợp lệ' })
  MONGODB_URI!: string;

  @IsString()
  @MinLength(32, { message: 'JWT_ACCESS_SECRET phải dài ít nhất 32 ký tự' })
  JWT_ACCESS_SECRET!: string;

  @IsString()
  JWT_ACCESS_TTL!: string;

  @IsString()
  @MinLength(32, { message: 'JWT_REFRESH_SECRET phải dài ít nhất 32 ký tự' })
  JWT_REFRESH_SECRET!: string;

  @IsString()
  JWT_REFRESH_TTL!: string;

  @IsString()
  @MinLength(32, { message: 'JWT_APP_ACCESS_SECRET phải dài ít nhất 32 ký tự' })
  JWT_APP_ACCESS_SECRET!: string;

  @IsString()
  JWT_APP_ACCESS_TTL!: string;

  @IsString()
  JWT_APP_REFRESH_TTL!: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const parsed = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(parsed, { skipMissingProperties: false });

  if (errors.length > 0) {
    const chiTiet = errors
      .map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(
      `Cấu hình môi trường không hợp lệ. Kiểm tra lại tệp .env:\n${chiTiet}\n\n` +
        'Tham khảo .env.example để biết đầy đủ các biến cần thiết.',
    );
  }

  if (parsed.JWT_ACCESS_SECRET === parsed.JWT_REFRESH_SECRET) {
    throw new Error('JWT_ACCESS_SECRET và JWT_REFRESH_SECRET phải khác nhau.');
  }
  if (
    parsed.JWT_APP_ACCESS_SECRET === parsed.JWT_ACCESS_SECRET ||
    parsed.JWT_APP_ACCESS_SECRET === parsed.JWT_REFRESH_SECRET
  ) {
    throw new Error('JWT_APP_ACCESS_SECRET phải khác cả hai khoá JWT của Web Admin.');
  }

  return parsed;
}
