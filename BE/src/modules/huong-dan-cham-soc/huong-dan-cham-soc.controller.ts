import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HuongDanChamSocService } from './huong-dan-cham-soc.service';
import { CapNhatHuongDanDto } from './dto/cap-nhat-huong-dan.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Hướng dẫn chăm sóc')
@Controller('huong-dan-cham-soc')
export class HuongDanChamSocController {
  constructor(private readonly service: HuongDanChamSocService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Toàn bộ hướng dẫn — app đọc để hiện thao tác từng bước' })
  danhSach() {
    return this.service.danhSach();
  }

  @Public()
  @Get(':loai')
  @ApiOperation({ summary: 'Hướng dẫn cho một loại việc cụ thể' })
  theoLoai(@Param('loai') loai: string) {
    return this.service.theoLoai(loai);
  }

  @Patch(':loai')
  @Roles(AdminRole.Admin, AdminRole.Content)
  @ApiOperation({ summary: 'Sửa nội dung hướng dẫn' })
  capNhat(
    @Param('loai') loai: string,
    @Body() du_lieu: CapNhatHuongDanDto,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.capNhat(loai, du_lieu, nguoiDung);
  }

  @Post('nap-mac-dinh')
  @Roles(AdminRole.Admin)
  @ApiOperation({ summary: 'Nạp hướng dẫn mặc định cho 4 loại việc, không ghi đè đã có' })
  napMacDinh() {
    return this.service.napMacDinh();
  }
}
