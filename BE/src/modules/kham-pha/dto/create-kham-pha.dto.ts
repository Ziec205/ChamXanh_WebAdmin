import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { LoaiKhamPha } from '../schemas/kham-pha.schema';

export class CreateKhamPhaDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Tiêu đề không được để trống' })
  tieuDe!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tomTat?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Nội dung không được để trống' })
  noiDung!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hinhAnh?: string;

  @ApiProperty({ enum: LoaiKhamPha })
  @IsEnum(LoaiKhamPha, { message: 'Loại không hợp lệ' })
  loai!: LoaiKhamPha;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  daXuatBan?: boolean;
}
