import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateBaiVietDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Tiêu đề không được để trống' })
  tieuDe!: string;

  @ApiProperty({ description: 'Chỉ chữ thường, số và dấu gạch ngang' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'Đường dẫn chỉ được chứa chữ thường, số và dấu gạch ngang' })
  duongDan!: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  daXuatBan?: boolean;
}
