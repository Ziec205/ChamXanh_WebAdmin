import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class BuocThucHienDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  thuTu!: number;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  tieuDe!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moTa?: string;
}
