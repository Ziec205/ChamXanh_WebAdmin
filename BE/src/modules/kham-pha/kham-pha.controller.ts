import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { KhamPhaService } from './kham-pha.service';
import { CreateKhamPhaDto } from './dto/create-kham-pha.dto';
import { UpdateKhamPhaDto } from './dto/update-kham-pha.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Khám phá')
@Controller('kham-pha')
@Roles(AdminRole.Admin, AdminRole.Content)
export class KhamPhaController {
  constructor(private readonly service: KhamPhaService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách nội dung khám phá' })
  danhSach() {
    return this.service.danhSach();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một mục khám phá' })
  chiTiet(@Param('id') id: string) {
    return this.service.chiTiet(id);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm nội dung khám phá mới' })
  taoMoi(@Body() du_lieu: CreateKhamPhaDto, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.taoMoi(du_lieu, nguoiDung);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa nội dung khám phá' })
  capNhat(
    @Param('id') id: string,
    @Body() du_lieu: UpdateKhamPhaDto,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.capNhat(id, du_lieu, nguoiDung);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá nội dung khám phá' })
  xoa(@Param('id') id: string, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.xoa(id, nguoiDung);
  }
}
