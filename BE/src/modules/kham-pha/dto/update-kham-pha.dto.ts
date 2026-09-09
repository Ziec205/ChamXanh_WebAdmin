import { PartialType } from '@nestjs/swagger';
import { CreateKhamPhaDto } from './create-kham-pha.dto';

export class UpdateKhamPhaDto extends PartialType(CreateKhamPhaDto) {}
