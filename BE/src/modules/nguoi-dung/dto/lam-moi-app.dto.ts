import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class LamMoiAppDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}
