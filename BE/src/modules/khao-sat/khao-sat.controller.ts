import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { KhaoSatService } from './khao-sat.service';
import { CapNhatCauHoiDto } from './dto/cap-nhat-cau-hoi.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Khảo sát nhập môn')
@Controller('khao-sat')
export class KhaoSatController {
  constructor(private readonly service: KhaoSatService) {}

  @Public()
  @Get('cau-hoi')
  @ApiOperation({ summary: 'Bộ câu hỏi đang hiển thị cho người dùng — app đọc khi làm khảo sát nhập môn' })
  danhSach() {
    return this.service.danhSach();
  }

  @Get('cau-hoi/tat-ca')
  @Roles(AdminRole.Admin, AdminRole.Content)
  @ApiOperation({ summary: 'Toàn bộ câu hỏi, gồm cả câu đang ẩn' })
  danhSachDayDu() {
    return this.service.danhSachDayDu();
  }

  @Patch('cau-hoi/:khoa')
  @Roles(AdminRole.Admin, AdminRole.Content)
  @ApiOperation({ summary: 'Sửa nội dung, thứ tự hoặc đáp án của một câu hỏi' })
  capNhat(
    @Param('khoa') khoa: string,
    @Body() du_lieu: CapNhatCauHoiDto,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.capNhat(khoa, du_lieu, nguoiDung);
  }

  @Post('cau-hoi/nap-mac-dinh')
  @Roles(AdminRole.Admin)
  @ApiOperation({ summary: 'Nạp bộ câu hỏi mặc định, không ghi đè câu đã chỉnh sửa' })
  napMacDinh() {
    return this.service.napMacDinh();
  }
}
