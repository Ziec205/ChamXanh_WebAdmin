import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class DapAnDto {
  @ApiProperty({ description: 'Giá trị gửi lên API, khớp với enum của thuật toán gợi ý' })
  @IsString()
  @MinLength(1, { message: 'Giá trị đáp án không được để trống' })
  giaTri!: string;

  @ApiProperty({ description: 'Nhãn hiển thị cho người dùng' })
  @IsString()
  @MinLength(1, { message: 'Nhãn đáp án không được để trống' })
  nhan!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moTa?: string;
}
