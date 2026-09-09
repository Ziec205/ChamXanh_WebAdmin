import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class DangNhapAppDto {
  @ApiProperty()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  matKhau!: string;
}
