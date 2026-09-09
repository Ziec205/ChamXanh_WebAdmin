import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Tình trạng hệ thống')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Kiểm tra API và kết nối cơ sở dữ liệu' })
  kiemTra() {
    const trangThaiMongo = ['đang ngắt', 'đã kết nối', 'đang kết nối', 'đang ngắt kết nối'];
    return {
      trangThai: 'ổn',
      thoiDiem: new Date().toISOString(),
      mongodb: trangThaiMongo[this.connection.readyState] ?? 'không rõ',
    };
  }
}
