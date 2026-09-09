import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, MaxLength, MinLength } from 'class-validator';
import { AdminRole } from '../schemas/admin-user.schema';

export class CreateAdminUserDto {
  @ApiProperty({ example: 'content@chamxanh.vn' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty({ example: 'MatKhauManh!2026', minLength: 10 })
  @IsString()
  @MinLength(10, { message: 'Mật khẩu phải dài ít nhất 10 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu không được dài quá 72 ký tự' })
  matKhau!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @MinLength(2, { message: 'Họ tên quá ngắn' })
  @MaxLength(80)
  hoTen!: string;

  @ApiProperty({ enum: AdminRole, example: AdminRole.Content })
  @IsEnum(AdminRole, { message: 'Vai trò phải là admin, content hoặc support' })
  vaiTro!: AdminRole;
}
