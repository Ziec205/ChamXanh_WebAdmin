import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAppAuthGuard } from '../nguoi-dung/guards/jwt-app-auth.guard';
import { CurrentAppUser } from '../nguoi-dung/guards/current-app-user.decorator';
import { GioHangService } from './gio-hang.service';
import { ThemVaoGioHangDto } from './dto/them-vao-gio-hang.dto';
import { CapNhatSoLuongDto } from './dto/cap-nhat-so-luong.dto';

@ApiTags('Giỏ hàng')
@Controller('gio-hang')
@Public()
@UseGuards(JwtAppAuthGuard)
export class GioHangController {
  constructor(private readonly service: GioHangService) {}

  @Get()
  @ApiOperation({ summary: 'Xem giỏ hàng của tôi' })
  cuaToi(@CurrentAppUser('id') nguoiDungId: string) {
    return this.service.cuaToi(nguoiDungId);
  }

  @Post()
  @ApiOperation({ summary: 'Thêm sản phẩm vào giỏ' })
  themVao(@CurrentAppUser('id') nguoiDungId: string, @Body() dto: ThemVaoGioHangDto) {
    return this.service.themVao(nguoiDungId, dto);
  }

  @Patch(':sanPhamId')
  @ApiOperation({ summary: 'Sửa số lượng một sản phẩm trong giỏ' })
  capNhatSoLuong(
    @CurrentAppUser('id') nguoiDungId: string,
    @Param('sanPhamId') sanPhamId: string,
    @Body() dto: CapNhatSoLuongDto,
  ) {
    return this.service.capNhatSoLuong(nguoiDungId, sanPhamId, dto.soLuong);
  }

  @Delete(':sanPhamId')
  @ApiOperation({ summary: 'Xoá một sản phẩm khỏi giỏ' })
  xoaMuc(@CurrentAppUser('id') nguoiDungId: string, @Param('sanPhamId') sanPhamId: string) {
    return this.service.xoaMuc(nguoiDungId, sanPhamId);
  }
}
