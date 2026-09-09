import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LienKetTiepThiService } from './lien-ket-tiep-thi.service';
import { CreateLienKetDto } from './dto/create-lien-ket.dto';
import { UpdateLienKetDto } from './dto/update-lien-ket.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Liên kết tiếp thị')
@Controller('lien-ket-tiep-thi')
@Roles(AdminRole.Admin, AdminRole.Content)
export class LienKetTiepThiController {
  constructor(private readonly service: LienKetTiepThiService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách liên kết tiếp thị' })
  danhSach() {
    return this.service.danhSach();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một liên kết' })
  chiTiet(@Param('id') id: string) {
    return this.service.chiTiet(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm liên kết tiếp thị mới' })
  taoMoi(@Body() du_lieu: CreateLienKetDto, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.taoMoi(du_lieu, nguoiDung);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa liên kết tiếp thị' })
  capNhat(
    @Param('id') id: string,
    @Body() du_lieu: UpdateLienKetDto,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.capNhat(id, du_lieu, nguoiDung);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá liên kết tiếp thị' })
  xoa(@Param('id') id: string, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.xoa(id, nguoiDung);
  }
}
