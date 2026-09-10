import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { SanPhamService } from './san-pham.service';

/** Danh mục Chợ Vật Tư công khai — người dùng app xem sản phẩm không cần đăng nhập. */
@ApiTags('Sản phẩm (app)')
@Controller('san-pham-dang-ban')
@Public()
export class SanPhamAppController {
  constructor(private readonly service: SanPhamService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm đang bán, lọc theo nhóm' })
  danhSach(@Query('nhom') nhom?: string) {
    return this.service.danhSachDangBan(nhom);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một sản phẩm đang bán' })
  chiTiet(@Param('id') id: string) {
    return this.service.chiTietDangBan(id);
  }
}
