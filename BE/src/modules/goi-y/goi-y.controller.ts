import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GoiYService } from './goi-y.service';
import { XinGoiYDto } from './dto/xin-goi-y.dto';

@ApiTags('Gợi ý cây trồng')
@Controller('goi-y')
export class GoiYController {
  constructor(private readonly service: GoiYService) {}

  @Post()
  @ApiOperation({
    summary: 'Gợi ý cây phù hợp từ câu trả lời khảo sát',
    description:
      'Chấm điểm bằng luật, không dùng mô hình ngôn ngữ: kết quả ổn định, ' +
      'chi phí bằng không, và câu giải thích khớp đúng với phép tính.',
  })
  goiY(@Body() dto: XinGoiYDto) {
    return this.service.goiY(dto);
  }
}
