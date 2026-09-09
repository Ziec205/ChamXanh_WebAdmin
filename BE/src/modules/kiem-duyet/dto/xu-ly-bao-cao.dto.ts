import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { TrangThaiBaoCao } from '../schemas/bao-cao.schema';

export class XuLyBaoCaoDto {
  @ApiProperty({ enum: [TrangThaiBaoCao.DaXuLy, TrangThaiBaoCao.DaBoQua] })
  @IsEnum(TrangThaiBaoCao, { message: 'Trạng thái không hợp lệ' })
  trangThai!: TrangThaiBaoCao;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ghiChuXuLy?: string;
}
