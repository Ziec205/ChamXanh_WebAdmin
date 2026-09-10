import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VuonService } from './vuon.service';
import { ThemCayVaoVuonDto } from './dto/them-cay.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAppAuthGuard } from '../nguoi-dung/guards/jwt-app-auth.guard';
import { CurrentAppUser } from '../nguoi-dung/guards/current-app-user.decorator';

/**
 * Vườn của tôi — dữ liệu RIÊNG của từng người dùng app, không phải nội dung
 * quản trị. Dùng JwtAppAuthGuard (không phải RolesGuard/AdminRole của Web
 * Admin) — mọi route ở đây @Public() để thoát guard toàn cục rồi tự áp
 * JwtAppAuthGuard, giống hệt mẫu ở NguoiDungAuthController.
 */
@ApiTags('Vườn của tôi')
@Controller('vuon')
@Public()
@UseGuards(JwtAppAuthGuard)
export class VuonController {
  constructor(private readonly service: VuonService) {}

  @Post('cay')
  @ApiOperation({ summary: 'Thêm một cây vào vườn — tự sinh lịch chăm sóc' })
  themCay(@CurrentAppUser('id') nguoiDungId: string, @Body() dto: ThemCayVaoVuonDto) {
    return this.service.themCay(nguoiDungId, dto);
  }

  @Get('cay')
  @ApiOperation({ summary: 'Danh sách cây trong vườn của tôi' })
  danhSachCay(@CurrentAppUser('id') nguoiDungId: string) {
    return this.service.danhSachCay(nguoiDungId);
  }

  @Get('cay/:id')
  @ApiOperation({ summary: 'Chi tiết một cây trong vườn' })
  chiTiet(@CurrentAppUser('id') nguoiDungId: string, @Param('id') id: string) {
    return this.service.chiTiet(nguoiDungId, id);
  }

  @Delete('cay/:id')
  @ApiOperation({ summary: 'Bỏ một cây khỏi vườn — xoá luôn lịch chăm sóc của cây đó' })
  xoaCay(@CurrentAppUser('id') nguoiDungId: string, @Param('id') id: string) {
    return this.service.xoaCay(nguoiDungId, id);
  }

  @Get('viec-cham-soc')
  @ApiOperation({ summary: 'Toàn bộ việc chăm sóc, gộp mọi cây, hạn gần nhất trước' })
  danhSachViec(@CurrentAppUser('id') nguoiDungId: string) {
    return this.service.danhSachViec(nguoiDungId);
  }

  @Patch('viec-cham-soc/:id/hoan-thanh')
  @ApiOperation({ summary: 'Đánh dấu đã làm — tự dời hạn tiếp theo từ hôm nay' })
  hoanThanhViec(@CurrentAppUser('id') nguoiDungId: string, @Param('id') id: string) {
    return this.service.hoanThanhViec(nguoiDungId, id);
  }
}
