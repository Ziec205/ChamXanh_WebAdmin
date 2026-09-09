import { PartialType } from '@nestjs/swagger';
import { CreateSanPhamDto } from './create-san-pham.dto';

export class UpdateSanPhamDto extends PartialType(CreateSanPhamDto) {}
