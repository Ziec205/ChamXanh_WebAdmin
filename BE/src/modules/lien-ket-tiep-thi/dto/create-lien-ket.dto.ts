import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { SanThuongMai } from '../schemas/lien-ket.schema';

export class CreateLienKetDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Tiêu đề không được để trống' })
  tieuDe!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiProperty()
  @IsUrl({}, { message: 'URL không hợp lệ' })
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hinhAnh?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ enum: SanThuongMai })
  @IsEnum(SanThuongMai, { message: 'Sàn phải là shopee, lazada hoặc khac' })
  san!: SanThuongMai;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dangHienThi?: boolean;
}
