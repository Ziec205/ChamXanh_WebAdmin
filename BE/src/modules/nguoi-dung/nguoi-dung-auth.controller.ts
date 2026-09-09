import { Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { NguoiDungAuthService } from './nguoi-dung-auth.service';
import { DangKyDto } from './dto/dang-ky.dto';
import { DangNhapAppDto } from './dto/dang-nhap-app.dto';
import { LamMoiAppDto } from './dto/lam-moi-app.dto';
import { DoiMatKhauAppDto } from './dto/doi-mat-khau-app.dto';
import { XoaTaiKhoanDto } from './dto/xoa-tai-khoan.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { JwtAppAuthGuard } from './guards/jwt-app-auth.guard';
import { CurrentAppUser, type AuthenticatedAppUser } from './guards/current-app-user.decorator';

/**
 * Xác thực cho người dùng ỨNG DỤNG di động — tách hoàn toàn khỏi `/auth`
 * (Web Admin). Toàn bộ route ở đây @Public() để thoát khỏi guard toàn cục
 * của Web Admin, rồi tự áp JwtAppAuthGuard cho route cần định danh.
 */
@ApiTags('Xác thực người dùng app')
@Controller('auth-app')
export class NguoiDungAuthController {
  constructor(private readonly auth: NguoiDungAuthService) {}

  @Public()
  @Post('dang-ky')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Đăng ký tài khoản người dùng app' })
  dangKy(@Body() dto: DangKyDto, @Headers('user-agent') userAgent?: string) {
    return this.auth.dangKy(dto, userAgent ?? '');
  }

  @Public()
  @Post('dang-nhap')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Đăng nhập vào app' })
  dangNhap(@Body() dto: DangNhapAppDto, @Headers('user-agent') userAgent?: string) {
    return this.auth.dangNhap(dto, userAgent ?? '');
  }

  @Public()
  @Post('lam-moi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy access token mới bằng refresh token' })
  lamMoi(@Body() dto: LamMoiAppDto, @Headers('user-agent') userAgent?: string) {
    return this.auth.lamMoiToken(dto.refreshToken, userAgent ?? '');
  }

  @Public()
  @Post('dang-xuat')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đăng xuất khỏi thiết bị hiện tại' })
  async dangXuat(@Body() dto: LamMoiAppDto) {
    await this.auth.dangXuat(dto.refreshToken);
  }

  @Public()
  @UseGuards(JwtAppAuthGuard)
  @Post('dang-xuat-moi-thiet-bi')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Thu hồi toàn bộ phiên đăng nhập của tài khoản' })
  async dangXuatMoiThietBi(@CurrentAppUser('id') id: string) {
    await this.auth.dangXuatMoiThietBi(id);
  }

  @Public()
  @UseGuards(JwtAppAuthGuard)
  @Post('doi-mat-khau')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Đổi mật khẩu',
    description: 'Đổi xong mọi phiên đăng nhập đều bị thu hồi, kể cả phiên hiện tại.',
  })
  async doiMatKhau(@CurrentAppUser('id') id: string, @Body() dto: DoiMatKhauAppDto) {
    await this.auth.doiMatKhau(id, dto);
  }

  @Public()
  @UseGuards(JwtAppAuthGuard)
  @Delete('xoa-tai-khoan')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Xoá tài khoản vĩnh viễn — bắt buộc để được duyệt App Store (Apple 5.1.1v)',
  })
  async xoaTaiKhoan(@CurrentAppUser('id') id: string, @Body() dto: XoaTaiKhoanDto) {
    await this.auth.xoaTaiKhoan(id, dto.matKhau);
  }

  @Public()
  @UseGuards(JwtAppAuthGuard)
  @Get('toi')
  @ApiOperation({ summary: 'Thông tin tài khoản app đang đăng nhập' })
  toi(@CurrentAppUser() nguoiDung: AuthenticatedAppUser) {
    return nguoiDung;
  }
}
