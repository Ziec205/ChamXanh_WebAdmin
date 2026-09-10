import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAppAuthGuard } from '../nguoi-dung/guards/jwt-app-auth.guard';
import { CurrentAppUser } from '../nguoi-dung/guards/current-app-user.decorator';
import { DonHangService } from './don-hang.service';
import { TaoDonHangDto } from './dto/tao-don-hang.dto';

@ApiTags('Đơn hàng (app)')
@Controller('don-hang-cua-toi')
@Public()
@UseGuards(JwtAppAuthGuard)
export class DonHangAppController {
  constructor(private readonly service: DonHangService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách đơn hàng của tôi' })
  danhSach(@CurrentAppUser('id') nguoiDungId: string) {
    return this.service.danhSachCuaToi(nguoiDungId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một đơn hàng của tôi' })
  chiTiet(@CurrentAppUser('id') nguoiDungId: string, @Param('id') id: string) {
    return this.service.chiTietCuaToi(nguoiDungId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Đặt đơn từ giỏ hàng hiện có' })
  taoMoi(@CurrentAppUser('id') nguoiDungId: string, @Body() dto: TaoDonHangDto) {
    return this.service.taoDonHangTuGioHang(nguoiDungId, dto);
  }
}
