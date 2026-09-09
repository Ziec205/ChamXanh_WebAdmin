import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { TrangThaiDonHang } from '../schemas/don-hang.schema';

export class CapNhatTrangThaiDonHangDto {
  @ApiProperty({ enum: TrangThaiDonHang })
  @IsEnum(TrangThaiDonHang, { message: 'Trạng thái đơn hàng không hợp lệ' })
  trangThai!: TrangThaiDonHang;
}
