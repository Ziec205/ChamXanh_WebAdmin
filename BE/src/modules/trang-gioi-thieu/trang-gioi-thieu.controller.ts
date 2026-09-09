import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TrangGioiThieuService } from './trang-gioi-thieu.service';
import { CreateBaiVietDto } from './dto/create-bai-viet.dto';
import { UpdateBaiVietDto } from './dto/update-bai-viet.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Trang giới thiệu')
@Controller('trang-gioi-thieu')
@Roles(AdminRole.Admin, AdminRole.Content)
export class TrangGioiThieuController {
  constructor(private readonly service: TrangGioiThieuService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách bài viết' })
  danhSach() {
    return this.service.danhSach();
  }

  @Get(':duongDan')
  @ApiOperation({ summary: 'Chi tiết một bài viết' })
  chiTiet(@Param('duongDan') duongDan: string) {
    return this.service.chiTiet(duongDan);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm bài viết mới' })
  taoMoi(@Body() du_lieu: CreateBaiVietDto, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.taoMoi(du_lieu, nguoiDung);
  }

  @Patch(':duongDan')
  @ApiOperation({ summary: 'Sửa bài viết' })
  capNhat(
    @Param('duongDan') duongDan: string,
    @Body() du_lieu: UpdateBaiVietDto,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.capNhat(duongDan, du_lieu, nguoiDung);
  }

  @Delete(':duongDan')
  @ApiOperation({ summary: 'Xoá bài viết' })
  xoa(@Param('duongDan') duongDan: string, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.xoa(duongDan, nguoiDung);
  }
}
