import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAppAuthGuard } from '../nguoi-dung/guards/jwt-app-auth.guard';
import { CurrentAppUser } from '../nguoi-dung/guards/current-app-user.decorator';
import { DiaChiService } from './dia-chi.service';
import { TaoDiaChiDto } from './dto/tao-dia-chi.dto';
import { CapNhatDiaChiDto } from './dto/cap-nhat-dia-chi.dto';

@ApiTags('Địa chỉ giao hàng')
@Controller('dia-chi')
@Public()
@UseGuards(JwtAppAuthGuard)
export class DiaChiController {
  constructor(private readonly service: DiaChiService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách địa chỉ đã lưu' })
  danhSach(@CurrentAppUser('id') nguoiDungId: string) {
    return this.service.danhSach(nguoiDungId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm địa chỉ mới' })
  taoMoi(@CurrentAppUser('id') nguoiDungId: string, @Body() dto: TaoDiaChiDto) {
    return this.service.taoMoi(nguoiDungId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Sửa địa chỉ' })
  capNhat(
    @CurrentAppUser('id') nguoiDungId: string,
    @Param('id') id: string,
    @Body() dto: CapNhatDiaChiDto,
  ) {
    return this.service.capNhat(nguoiDungId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xoá địa chỉ' })
  xoa(@CurrentAppUser('id') nguoiDungId: string, @Param('id') id: string) {
    return this.service.xoa(nguoiDungId, id);
  }
}
