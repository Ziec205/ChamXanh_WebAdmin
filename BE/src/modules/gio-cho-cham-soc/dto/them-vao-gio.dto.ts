import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class ThemVaoGioDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  sanPhamId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  lyDo!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  soLuong?: number;
}
