import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DauHieuBenhDto {
  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Triệu chứng không được để trống' })
  trieuChung!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Nguyên nhân không được để trống' })
  nguyenNhan!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1, { message: 'Cách xử lý không được để trống' })
  cachXuLy!: string;
}
