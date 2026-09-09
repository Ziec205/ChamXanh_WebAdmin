import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser, AuthenticatedUser } from 'src/common/decorators/current-user.decorator';

@ApiTags('Xác thực')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('dang-nhap')
  @HttpCode(HttpStatus.OK)
  // Chặn dò mật khẩu: tối đa 5 lần thử mỗi phút trên một địa chỉ IP.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Đăng nhập vào Web Admin' })
  dangNhap(@Body() dto: LoginDto, @Headers('user-agent') userAgent?: string) {
    return this.auth.dangNhap(dto, userAgent ?? '');
  }

  @Public()
  @Post('lam-moi')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lấy access token mới bằng refresh token' })
  lamMoi(@Body() dto: RefreshDto, @Headers('user-agent') userAgent?: string) {
    return this.auth.lamMoiToken(dto.refreshToken, userAgent ?? '');
  }

  @Public()
  @Post('dang-xuat')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Đăng xuất khỏi thiết bị hiện tại' })
  async dangXuat(@Body() dto: RefreshDto) {
    await this.auth.dangXuat(dto.refreshToken);
  }

  @Post('dang-xuat-moi-thiet-bi')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Thu hồi toàn bộ phiên đăng nhập của tài khoản' })
  async dangXuatMoiThietBi(@CurrentUser('id') id: string) {
    await this.auth.dangXuatMoiThietBi(id);
  }

  @Get('toi')
  @ApiOperation({ summary: 'Thông tin tài khoản đang đăng nhập' })
  toi(@CurrentUser() nguoiDung: AuthenticatedUser) {
    return nguoiDung;
  }
}
