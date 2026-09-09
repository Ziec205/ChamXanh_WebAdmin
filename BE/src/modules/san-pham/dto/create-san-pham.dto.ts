import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { NhomSanPham } from '../schemas/san-pham.schema';

export class CreateSanPhamDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Tên sản phẩm không được để trống' })
  ten!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiProperty({ enum: NhomSanPham })
  @IsEnum(NhomSanPham, { message: 'Nhóm sản phẩm không hợp lệ' })
  nhom!: NhomSanPham;

  @ApiProperty()
  @IsInt({ message: 'Giá phải là số nguyên (đồng)' })
  @Min(0)
  gia!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  tonKho?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  hinhAnh?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dangBan?: boolean;
}
