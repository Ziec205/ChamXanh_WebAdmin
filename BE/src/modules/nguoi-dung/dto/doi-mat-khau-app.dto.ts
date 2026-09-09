import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DoiMatKhauAppDto {
  @ApiProperty()
  @IsString()
  matKhauHienTai!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8, { message: 'Mật khẩu mới phải có ít nhất 8 ký tự' })
  matKhauMoi!: string;
}
