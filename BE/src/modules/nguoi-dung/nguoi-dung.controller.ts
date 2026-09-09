import { Controller, Get, Param, Patch, Query, Body } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NguoiDungService } from './nguoi-dung.service';
import { KhoaNguoiDungDto } from './dto/khoa-nguoi-dung.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Người dùng app')
@Controller('nguoi-dung')
@Roles(AdminRole.Admin, AdminRole.Support)
export class NguoiDungController {
  constructor(private readonly service: NguoiDungService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách người dùng, lọc theo email' })
  danhSach(
    @Query('email') email?: string,
    @Query('trang') trang?: string,
    @Query('moiTrang') moiTrang?: string,
  ) {
    return this.service.danhSach({
      email,
      trang: trang ? Number(trang) : undefined,
      moiTrang: moiTrang ? Number(moiTrang) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một người dùng' })
  chiTiet(@Param('id') id: string) {
    return this.service.chiTiet(id);
  }

  @Patch(':id/khoa')
  @ApiOperation({ summary: 'Khoá tài khoản người dùng' })
  khoa(
    @Param('id') id: string,
    @Body() du_lieu: KhoaNguoiDungDto,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.khoa(id, du_lieu, nguoiDung);
  }

  @Patch(':id/kich-hoat')
  @ApiOperation({ summary: 'Kích hoạt lại tài khoản đã khoá' })
  kichHoat(@Param('id') id: string, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.kichHoat(id, nguoiDung);
  }
}
