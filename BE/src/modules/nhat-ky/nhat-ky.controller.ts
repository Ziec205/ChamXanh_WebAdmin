import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NhatKyService } from './nhat-ky.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';

@ApiTags('Nhật ký thao tác')
@Controller('nhat-ky')
@Roles(AdminRole.Admin)
export class NhatKyController {
  constructor(private readonly service: NhatKyService) {}

  @Get()
  @ApiOperation({ summary: 'Nhật ký thao tác của người quản trị' })
  danhSach(
    @Query('doiTuong') doiTuong?: string,
    @Query('email') email?: string,
    @Query('trang') trang?: string,
  ) {
    return this.service.danhSach({ doiTuong, email, trang: trang ? Number(trang) : 1 });
  }
}
