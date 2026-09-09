import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SanPhamService } from './san-pham.service';
import { CreateSanPhamDto } from './dto/create-san-pham.dto';
import { UpdateSanPhamDto } from './dto/update-san-pham.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Sản phẩm')
@Controller('san-pham')
@Roles(AdminRole.Admin, AdminRole.Content)
export class SanPhamController {
  constructor(private readonly service: SanPhamService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách sản phẩm' })
  danhSach() {
    return this.service.danhSach();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một sản phẩm' })
  chiTiet(@Param('id') id: string) {
    return this.service.chiTiet(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm mới' })
  taoMoi(@Body() du_lieu: CreateSanPhamDto, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.taoMoi(du_lieu, nguoiDung);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa sản phẩm' })
  capNhat(
    @Param('id') id: string,
    @Body() du_lieu: UpdateSanPhamDto,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.capNhat(id, du_lieu, nguoiDung);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá sản phẩm' })
  xoa(@Param('id') id: string, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.xoa(id, nguoiDung);
  }
}
