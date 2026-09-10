import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsOptional, IsString, ValidateNested } from 'class-validator';
import { TaoDiaChiDto } from '../../dia-chi/dto/tao-dia-chi.dto';
import { PhuongThucThanhToan } from '../schemas/don-hang.schema';

/** MoMo chưa có tài khoản merchant thật — chỉ nhận COD/chuyển khoản ở GĐ 7. */
const PHUONG_THUC_DA_HO_TRO = [PhuongThucThanhToan.Cod, PhuongThucThanhToan.ChuyenKhoan] as const;

export class TaoDonHangDto {
  @ApiPropertyOptional({ description: 'Dùng một địa chỉ đã lưu' })
  @IsOptional()
  @IsString()
  diaChiId?: string;

  @ApiPropertyOptional({ description: 'Hoặc nhập địa chỉ mới ngay lúc đặt đơn' })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaoDiaChiDto)
  diaChiMoi?: TaoDiaChiDto;

  @IsIn(PHUONG_THUC_DA_HO_TRO)
  phuongThucThanhToan!: PhuongThucThanhToan;
}
