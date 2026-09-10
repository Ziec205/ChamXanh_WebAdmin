import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { BuocThucHienDto } from './buoc-thuc-hien.dto';

/**
 * Trường `loai` KHÔNG được đổi sau khi tạo — app tham chiếu hướng dẫn theo
 * đúng giá trị này. Vẫn khai kèm validator để ValidationPipe không từ chối
 * cả request khi client vô tình gửi kèm (giống UpdatePlantDto.ma).
 */
export class CapNhatHuongDanDto {
  @ApiPropertyOptional({ description: 'Gửi lên cũng bị bỏ qua — loại việc không đổi được' })
  @IsOptional()
  @IsString()
  loai?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  tieuDe?: string;

  @ApiPropertyOptional({ type: [BuocThucHienDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Phải có ít nhất một bước' })
  @ValidateNested({ each: true })
  @Type(() => BuocThucHienDto)
  cacBuoc?: BuocThucHienDto[];
}
