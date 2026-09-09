import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from './schemas/admin-user.schema';

@ApiTags('Tài khoản quản trị')
@Controller('admin-users')
@Roles(AdminRole.Admin) // Toàn bộ controller chỉ dành cho vai admin
export class AdminUsersController {
  constructor(private readonly service: AdminUsersService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo tài khoản quản trị mới' })
  taoMoi(@Body() dto: CreateAdminUserDto) {
    return this.service.taoMoi(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách tài khoản quản trị' })
  danhSach() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một tài khoản quản trị' })
  chiTiet(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/vo-hieu-hoa')
  @ApiOperation({ summary: 'Vô hiệu hoá tài khoản quản trị' })
  voHieuHoa(@Param('id') id: string) {
    return this.service.doiTrangThai(id, false);
  }

  @Patch(':id/kich-hoat')
  @ApiOperation({ summary: 'Kích hoạt lại tài khoản quản trị' })
  kichHoat(@Param('id') id: string) {
    return this.service.doiTrangThai(id, true);
  }
}
