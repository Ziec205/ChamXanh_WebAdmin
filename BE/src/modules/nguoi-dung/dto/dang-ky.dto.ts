import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class DangKyDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
  matKhau!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hoTen?: string;
}
