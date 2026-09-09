import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import {
  CONG_DUNG,
  MENH,
  MUC_AM,
  MUC_SANG,
  NHOM_CAY,
  type CongDung,
  type Menh,
  type MucAm,
  type MucSang,
  type NhomCay,
} from 'src/common/constants/cay-trong.const';
import { DauHieuBenhDto } from './dau-hieu-benh.dto';

/**
 * DTO đầy đủ cho việc tạo một loài cây mới.
 *
 * Khớp 1-1 với ràng buộc trong Plant schema — viết riêng vì Mongoose @Prop
 * không phải là decorator class-validator, nên ValidationPipe không tự suy
 * ra được ràng buộc nào từ chính schema.
 */
export class CreatePlantDto {
  @ApiProperty({ description: 'Mã không dấu, dùng gạch ngang, ví dụ luoi-ho' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Mã phải viết không dấu, chỉ gồm chữ thường, số và gạch ngang',
  })
  ma!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Tên tiếng Việt không được để trống' })
  @MaxLength(80)
  tenVi!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  tenEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  tenKhoaHoc?: string;

  @ApiProperty({ enum: NHOM_CAY })
  @IsEnum(NHOM_CAY)
  nhom!: NhomCay;

  @ApiProperty({ enum: MUC_SANG })
  @IsEnum(MUC_SANG)
  anhSangToiThieu!: MucSang;

  @ApiProperty({ enum: MUC_SANG })
  @IsEnum(MUC_SANG)
  anhSangLyTuong!: MucSang;

  @ApiProperty({ minimum: 1, maximum: 60 })
  @IsInt()
  @Min(1)
  @Max(60)
  chuKyTuoiMuaKho!: number;

  @ApiProperty({ minimum: 1, maximum: 60 })
  @IsInt()
  @Min(1)
  @Max(60)
  chuKyTuoiMuaMua!: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 10, default: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  doSauKiemTraDat?: number;

  @ApiPropertyOptional({ minimum: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  chuKyBonPhan?: number | null;

  @ApiPropertyOptional({ minimum: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  chuKyThayDat?: number | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  canPhunSuong?: boolean;

  @ApiPropertyOptional({ default: 18 })
  @IsOptional()
  @IsInt()
  nhietDoNgayMin?: number;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @IsInt()
  nhietDoNgayMax?: number;

  @ApiPropertyOptional({ default: 16 })
  @IsOptional()
  @IsInt()
  nhietDoDemMin?: number;

  @ApiPropertyOptional({ default: 24 })
  @IsOptional()
  @IsInt()
  nhietDoDemMax?: number;

  @ApiProperty({ enum: MUC_AM })
  @IsEnum(MUC_AM)
  doAm!: MucAm;

  @ApiProperty({ description: 'An toàn với chó mèo hay không — bộ lọc cứng của thuật toán gợi ý' })
  @IsBoolean()
  anToanThuNuoi!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  ghiChuDocTinh?: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  doKho!: number;

  @ApiProperty({ minimum: 5, maximum: 200 })
  @IsInt()
  @Min(5)
  @Max(200)
  kichThuocChauCm!: number;

  @ApiPropertyOptional({ minimum: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  khoangCachTrongCm?: number | null;

  @ApiPropertyOptional({ enum: MENH, nullable: true })
  @IsOptional()
  @IsEnum(MENH)
  menhPhongThuy?: Menh | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  yNghiaPhongThuy?: string;

  @ApiPropertyOptional({ minimum: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  ngayThuHoach?: number | null;

  @ApiPropertyOptional({ type: [String], description: 'Mảng mã cây trồng xen được' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  trongXenDuocVoi?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Mảng mã cây không nên trồng cùng' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayUnique()
  khongTrongCungVoi?: string[];

  @ApiPropertyOptional({ enum: CONG_DUNG, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(CONG_DUNG, { each: true })
  @ArrayUnique()
  congDung?: CongDung[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(400)
  moTaNgan?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  huongDanChamSoc?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  anhUrl?: string;

  @ApiPropertyOptional({ type: [DauHieuBenhDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DauHieuBenhDto)
  dauHieuBenhThuongGap?: DauHieuBenhDto[];

  @ApiPropertyOptional({ default: false, description: 'Chỉ bật sau khi đã đối chiếu ít nhất hai nguồn' })
  @IsOptional()
  @IsBoolean()
  daKiemChung?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  dangHienThi?: boolean;
}
