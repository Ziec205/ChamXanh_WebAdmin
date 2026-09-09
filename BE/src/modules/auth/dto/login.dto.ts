import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@chamxanh.vn' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty({ example: 'MatKhauManh!2026' })
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu' })
  matKhau!: string;
}
