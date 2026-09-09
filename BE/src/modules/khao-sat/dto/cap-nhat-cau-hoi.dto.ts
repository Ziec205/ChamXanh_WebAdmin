import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DapAnDto } from './dap-an.dto';

/**
 * Trường `khoa` KHÔNG được phép sửa — thuật toán gợi ý đọc câu trả lời theo
 * đúng khoá này. Vẫn phải khai ở đây kèm validator (dù chẳng dùng tới) để
 * ValidationPipe không từ chối nguyên request bằng lỗi "thuộc tính lạ" khi
 * client vô tình gửi kèm — KhaoSatService.capNhat luôn xoá trường này trước
 * khi ghi, y hệt cách UpdatePlantDto xử lý trường `ma`.
 */
export class CapNhatCauHoiDto {
  @ApiPropertyOptional({ description: 'Gửi lên cũng bị bỏ qua — khoá không đổi được' })
  @IsOptional()
  @IsString()
  khoa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  thuTu?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Nội dung câu hỏi không được để trống' })
  cauHoi?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  moTa?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  nhieuLuaChon?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  batBuoc?: boolean;

  @ApiPropertyOptional({ type: [DapAnDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Câu hỏi phải có ít nhất một đáp án' })
  @ValidateNested({ each: true })
  @Type(() => DapAnDto)
  dapAn?: DapAnDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  dangHienThi?: boolean;
}
