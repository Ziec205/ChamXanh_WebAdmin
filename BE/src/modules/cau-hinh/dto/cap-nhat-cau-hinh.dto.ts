import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';

class TrongSoDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) anhSang?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) thoiGian?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) kinhNghiem?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) dienTich?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) mucDich?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(100) phongThuy?: number;
}

class HanMucDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) @Max(1000) mienPhi?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(10000) goiCoBan?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(10000) goiNangCao?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(2) @Max(100) soLuotMoiHoiThoai?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(1000) soCauMoiGio?: number;
}

class GiaGoiDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) coBan?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) nangCao?: number;
}

class BaoTriDto {
  @ApiPropertyOptional() @IsOptional() @IsBoolean() dangBat?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(500) noiDung?: string;
}

export class CapNhatCauHinhDto {
  @ApiPropertyOptional({ type: HanMucDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => HanMucDto)
  hanMucAI?: HanMucDto;

  @ApiPropertyOptional({ type: GiaGoiDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GiaGoiDto)
  giaGoi?: GiaGoiDto;

  @ApiPropertyOptional({ type: TrongSoDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TrongSoDto)
  trongSoGoiY?: TrongSoDto;

  @ApiPropertyOptional({ description: 'Bật tắt tính năng, ví dụ { "congDong": true }' })
  @IsOptional()
  @IsObject()
  congTacTinhNang?: Record<string, boolean>;

  @ApiPropertyOptional({ type: BaoTriDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BaoTriDto)
  thongBaoBaoTri?: BaoTriDto;
}
