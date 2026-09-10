import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class TaoDiaChiDto {
  @IsString()
  @MinLength(1)
  hoTen!: string;

  @IsString()
  @MinLength(1)
  soDienThoai!: string;

  @IsString()
  @MinLength(1)
  diaChiChiTiet!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phuongXa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tinhThanh?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  macDinh?: boolean;
}
