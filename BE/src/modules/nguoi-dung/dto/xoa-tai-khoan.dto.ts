import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/** Bắt gõ lại mật khẩu trước khi xoá vĩnh viễn — Apple 5.1.1v yêu cầu xoá được NGAY trong app. */
export class XoaTaiKhoanDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  matKhau!: string;
}
