import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CauHinhService } from './cau-hinh.service';
import { CapNhatCauHinhDto } from './dto/cap-nhat-cau-hinh.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Cấu hình hệ thống')
@Controller('cau-hinh')
export class CauHinhController {
  constructor(private readonly service: CauHinhService) {}

  @Get()
  @ApiOperation({ summary: 'Đọc cấu hình hiện tại' })
  lay() {
    return this.service.lay();
  }

  @Patch()
  @Roles(AdminRole.Admin)
  @ApiOperation({
    summary: 'Sửa cấu hình hệ thống',
    description:
      'Chỉ vai Quản trị. Mọi thay đổi được ghi vào nhật ký kèm giá trị trước và sau, ' +
      'vì đây là những con số ảnh hưởng trực tiếp tới chi phí và doanh thu.',
  })
  capNhat(@Body() dto: CapNhatCauHinhDto, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.capNhat(dto, nguoiDung);
  }
}
