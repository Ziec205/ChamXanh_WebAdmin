import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PlantsService } from './plants.service';
import { QueryPlantDto } from './dto/query-plant.dto';
import { Plant } from './schemas/plant.schema';
import { Roles } from 'src/common/decorators/roles.decorator';
import { AdminRole } from '../admin-users/schemas/admin-user.schema';
import { CurrentUser, type AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Cây trồng')
@Controller('cay-trong')
export class PlantsController {
  constructor(private readonly service: PlantsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách cây trồng, có tìm kiếm và phân trang' })
  danhSach(@Query() q: QueryPlantDto) {
    return this.service.danhSach(q);
  }

  @Get('thong-ke')
  @ApiOperation({ summary: 'Số liệu tổng quan cho bảng điều khiển' })
  async thongKe() {
    const [ketQua] = await this.service.thongKe();
    return ketQua ?? { tong: 0, daKiemChung: 0, dangHienThi: 0, anToanThuNuoi: 0 };
  }

  @Get(':ma')
  @ApiOperation({ summary: 'Chi tiết một loài cây' })
  chiTiet(@Param('ma') ma: string) {
    return this.service.theoMa(ma);
  }

  @Post()
  @Roles(AdminRole.Admin, AdminRole.Content)
  @ApiOperation({ summary: 'Thêm loài cây mới' })
  taoMoi(@Body() du_lieu: Partial<Plant>, @CurrentUser() nguoiDung: AuthenticatedUser) {
    return this.service.taoMoi(du_lieu, nguoiDung);
  }

  @Patch(':ma')
  @Roles(AdminRole.Admin, AdminRole.Content)
  @ApiOperation({ summary: 'Cập nhật một loài cây' })
  capNhat(
    @Param('ma') ma: string,
    @Body() du_lieu: Partial<Plant>,
    @CurrentUser() nguoiDung: AuthenticatedUser,
  ) {
    return this.service.capNhat(ma, du_lieu, nguoiDung);
  }
}
