import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { MIEN, NOI_DAT, type Mien, type NoiDat } from 'src/common/constants/cay-trong.const';

export class ThemCayVaoVuonDto {
  @ApiProperty({ description: 'Mã loài cây trong danh mục /cay-trong' })
  @IsString()
  @MinLength(1)
  maCay!: string;

  @ApiPropertyOptional({ description: 'Tên gọi riêng, ví dụ "Bé Trầu Bà góc bàn"' })
  @IsOptional()
  @IsString()
  tenGoi?: string;

  @ApiProperty({ enum: MIEN })
  @IsEnum(MIEN, { message: `Miền phải là một trong: ${MIEN.join(', ')}` })
  mien!: Mien;

  @ApiProperty({ enum: NOI_DAT })
  @IsEnum(NOI_DAT, { message: `Nơi đặt phải là một trong: ${NOI_DAT.join(', ')}` })
  noiDat!: NoiDat;
}
