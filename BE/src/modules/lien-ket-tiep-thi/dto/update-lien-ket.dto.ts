import { PartialType } from '@nestjs/swagger';
import { CreateLienKetDto } from './create-lien-ket.dto';

export class UpdateLienKetDto extends PartialType(CreateLienKetDto) {}
