import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreatePlantDto } from './create-plant.dto';

/**
 * Mọi trường đều tuỳ chọn. `ma` được khai lại có validator để không bị
 * ValidationPipe từ chối bằng lỗi "thuộc tính lạ" — nhưng PlantsService.capNhat
 * luôn xoá trường này trước khi ghi, vì mã là khoá liên kết với trongXenDuocVoi
 * của loài khác, đổi mã qua đường cập nhật là đứt tham chiếu.
 */
export class UpdatePlantDto extends PartialType(OmitType(CreatePlantDto, ['ma'] as const)) {
  @ApiPropertyOptional({ description: 'Gửi lên cũng bị bỏ qua — mã không đổi được sau khi tạo' })
  @IsOptional()
  @IsString()
  ma?: string;
}
