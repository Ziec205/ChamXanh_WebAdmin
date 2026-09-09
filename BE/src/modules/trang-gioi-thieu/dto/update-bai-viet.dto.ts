import { ApiPropertyOptional, PartialType, OmitType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateBaiVietDto } from './create-bai-viet.dto';

export class UpdateBaiVietDto extends PartialType(OmitType(CreateBaiVietDto, ['duongDan'] as const)) {
  @ApiPropertyOptional({ description: 'Gửi lên cũng bị bỏ qua — đường dẫn không đổi được sau khi tạo, để không vỡ liên kết đã chia sẻ' })
  @IsOptional()
  @IsString()
  duongDan?: string;
}
