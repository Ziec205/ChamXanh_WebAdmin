import { PartialType } from '@nestjs/swagger';
import { TaoDiaChiDto } from './tao-dia-chi.dto';

export class CapNhatDiaChiDto extends PartialType(TaoDiaChiDto) {}
