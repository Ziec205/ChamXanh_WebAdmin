import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GioChoChamSocService } from './gio-cho-cham-soc.service';
import { ThemVaoGioDto } from './dto/them-vao-gio.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAppAuthGuard } from '../nguoi-dung/guards/jwt-app-auth.guard';
import { CurrentAppUser } from '../nguoi-dung/guards/current-app-user.decorator';

@ApiTags('Giỏ Chờ Chăm Sóc')
@Controller('gio-cho-cham-soc')
@Public()
@UseGuards(JwtAppAuthGuard)
export class GioChoChamSocController {
  constructor(private readonly service: GioChoChamSocService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách mục đang có trong giỏ' })
  danhSach(@CurrentAppUser('id') nguoiDungId: string) {
    return this.service.danhSach(nguoiDungId);
  }

  @Get('goi-y')
  @ApiOperation({ summary: 'Gợi ý vật tư theo việc chăm sóc sắp tới — chưa lưu vào giỏ' })
  goiY(@CurrentAppUser('id') nguoiDungId: string) {
    return this.service.goiY(nguoiDungId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm một sản phẩm vào giỏ' })
  themVaoGio(@CurrentAppUser('id') nguoiDungId: string, @Body() dto: ThemVaoGioDto) {
    return this.service.themVaoGio(nguoiDungId, dto);
  }

  @Patch(':id/danh-dau-da-mua')
  @ApiOperation({ summary: 'Đánh dấu đã mua' })
  danhDauDaMua(@CurrentAppUser('id') nguoiDungId: string, @Param('id') id: string) {
    return this.service.danhDauDaMua(nguoiDungId, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Bỏ khỏi giỏ' })
  xoa(@CurrentAppUser('id') nguoiDungId: string, @Param('id') id: string) {
    return this.service.xoa(nguoiDungId, id);
  }
}
