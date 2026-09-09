import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class DoiMatKhauDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Vui lòng nhập mật khẩu hiện tại' })
  matKhauHienTai!: string;

  @ApiProperty({ minLength: 10 })
  @IsString()
  @MinLength(10, { message: 'Mật khẩu mới phải dài ít nhất 10 ký tự' })
  @MaxLength(72, { message: 'Mật khẩu không được dài quá 72 ký tự' })
  matKhauMoi!: string;
}
