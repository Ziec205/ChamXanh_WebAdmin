import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayUnique, IsBoolean, IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import {
  CONG_DUNG,
  DIEN_TICH,
  HUONG,
  KINH_NGHIEM,
  MENH,
  MIEN,
  NOI_DAT,
  THOI_GIAN_RANH,
  type CongDung,
  type DienTich,
  type Huong,
  type KinhNghiem,
  type Menh,
  type Mien,
  type NoiDat,
  type ThoiGianRanh,
} from 'src/common/constants/cay-trong.const';

export class XinGoiYDto {
  @ApiProperty({ enum: NOI_DAT })
  @IsEnum(NOI_DAT)
  noiDat!: NoiDat;

  @ApiProperty({ enum: HUONG })
  @IsEnum(HUONG)
  huong!: Huong;

  @ApiProperty({ enum: DIEN_TICH })
  @IsEnum(DIEN_TICH)
  dienTich!: DienTich;

  @ApiProperty({ enum: KINH_NGHIEM })
  @IsEnum(KINH_NGHIEM)
  kinhNghiem!: KinhNghiem;

  @ApiProperty({ enum: THOI_GIAN_RANH })
  @IsEnum(THOI_GIAN_RANH)
  thoiGianRanh!: ThoiGianRanh;

  @ApiProperty({ description: 'Nhà có nuôi chó mèo không — đây là bộ lọc cứng' })
  @IsBoolean()
  coThuNuoi!: boolean;

  @ApiProperty({ enum: MIEN })
  @IsEnum(MIEN)
  mien!: Mien;

  @ApiPropertyOptional({ enum: CONG_DUNG, isArray: true })
  @IsOptional()
  @IsEnum(CONG_DUNG, { each: true })
  @ArrayUnique()
  mucDich?: CongDung[];

  @ApiPropertyOptional({ enum: MENH, nullable: true })
  @IsOptional()
  @IsEnum(MENH)
  menh?: Menh;

  @ApiPropertyOptional({ default: 6, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  soLuong?: number;
}
