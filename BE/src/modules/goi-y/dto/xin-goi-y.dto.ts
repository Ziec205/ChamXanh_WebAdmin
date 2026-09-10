import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
// Dùng IsIn chứ không phải IsEnum: các hằng ở đây là mảng `as const`, không phải
// TS enum. IsEnum vẫn chặn đúng giá trị sai nhưng in ra thông báo rỗng
// ("must be one of the following values: ") vì nó đọc Object.keys — với mảng thì
// đó là chỉ số 0,1,2 và bị lọc hết, nên client không bao giờ biết giá trị nào hợp lệ.
import { ArrayUnique, IsBoolean, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
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
  @IsIn(NOI_DAT)
  noiDat!: NoiDat;

  @ApiProperty({ enum: HUONG })
  @IsIn(HUONG)
  huong!: Huong;

  @ApiProperty({ enum: DIEN_TICH })
  @IsIn(DIEN_TICH)
  dienTich!: DienTich;

  @ApiProperty({ enum: KINH_NGHIEM })
  @IsIn(KINH_NGHIEM)
  kinhNghiem!: KinhNghiem;

  @ApiProperty({ enum: THOI_GIAN_RANH })
  @IsIn(THOI_GIAN_RANH)
  thoiGianRanh!: ThoiGianRanh;

  @ApiProperty({ description: 'Nhà có nuôi chó mèo không — đây là bộ lọc cứng' })
  @IsBoolean()
  coThuNuoi!: boolean;

  @ApiProperty({ enum: MIEN })
  @IsIn(MIEN)
  mien!: Mien;

  @ApiPropertyOptional({ enum: CONG_DUNG, isArray: true })
  @IsOptional()
  @IsIn(CONG_DUNG, { each: true })
  @ArrayUnique()
  mucDich?: CongDung[];

  @ApiPropertyOptional({ enum: MENH, nullable: true })
  @IsOptional()
  @IsIn(MENH)
  menh?: Menh;

  @ApiPropertyOptional({ default: 6, maximum: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  soLuong?: number;
}
