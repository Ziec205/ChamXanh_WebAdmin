import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { NHOM_CAY, type NhomCay } from 'src/common/constants/cay-trong.const';

export class QueryPlantDto {
  @ApiPropertyOptional({ description: 'Tìm theo tên tiếng Việt' })
  @IsOptional()
  @IsString()
  tim?: string;

  @ApiPropertyOptional({ enum: NHOM_CAY })
  @IsOptional()
  @IsIn(NHOM_CAY)
  nhom?: NhomCay;

  @ApiPropertyOptional({ description: 'Lọc theo trạng thái kiểm chứng' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  daKiemChung?: boolean;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  trang?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  moiTrang?: number = 20;
}
