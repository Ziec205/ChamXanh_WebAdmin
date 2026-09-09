import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DonHangService } from './don-hang.service';
import { CapNhatTrangThaiDonHangDto } from './dto/cap-nhat-trang-thai.dto';
import { TrangThaiDonHang } from './schemas/don-hang.schema';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Đơn hàng')
@Controller('don-hang')
@Roles(AdminRole.Admin, AdminRole.Support)
export class DonHangController {
  constructor(private readonly service: DonHangService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách đơn hàng, lọc theo trạng thái' })
  danhSach(@Query('trangThai') trangThai?: TrangThaiDonHang) {
    return this.service.danhSach({ trangThai });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một đơn hàng' })
  chiTiet(@Param('id') id: string) {
    return this.service.chiTiet(id);
  }

  @Patch(':id/trang-thai')
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn hàng' })
  capNhatTrangThai(
    @Param('id') id: string,
    @Body() du_lieu: CapNhatTrangThaiDonHangDto,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.capNhatTrangThai(id, du_lieu, nguoiDung);
  }
}
