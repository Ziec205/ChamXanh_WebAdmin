import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { TrangGioiThieuService } from './trang-gioi-thieu.service';

/** Nội dung web giới thiệu công khai — chỉ bài đã xuất bản, không cần đăng nhập. */
@ApiTags('Trang giới thiệu (công khai)')
@Controller('trang-gioi-thieu-cong-khai')
@Public()
export class TrangGioiThieuCongKhaiController {
  constructor(private readonly service: TrangGioiThieuService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách bài viết đã xuất bản' })
  danhSach() {
    return this.service.danhSachDaXuatBan();
  }

  @Get(':duongDan')
  @ApiOperation({ summary: 'Chi tiết một bài viết đã xuất bản' })
  chiTiet(@Param('duongDan') duongDan: string) {
    return this.service.chiTietDaXuatBan(duongDan);
  }
}
