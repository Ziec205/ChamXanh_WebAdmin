import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { KiemDuyetService } from './kiem-duyet.service';
import { XuLyBaoCaoDto } from './dto/xu-ly-bao-cao.dto';
import { TrangThaiBaoCao } from './schemas/bao-cao.schema';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Kiểm duyệt')
@Controller('kiem-duyet')
@Roles(AdminRole.Admin, AdminRole.Support)
export class KiemDuyetController {
  constructor(private readonly service: KiemDuyetService) {}

  @Get()
  @ApiOperation({ summary: 'Hàng đợi báo cáo, lọc theo trạng thái' })
  danhSach(@Query('trangThai') trangThai?: TrangThaiBaoCao) {
    return this.service.danhSach({ trangThai });
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Xử lý một báo cáo — đánh dấu đã xử lý hoặc bỏ qua' })
  xuLy(
    @Param('id') id: string,
    @Body() du_lieu: XuLyBaoCaoDto,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.xuLy(id, du_lieu, nguoiDung);
  }
}
