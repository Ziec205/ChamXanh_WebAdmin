import { IsInt, Min } from 'class-validator';

export class CapNhatSoLuongDto {
  @IsInt()
  @Min(1)
  soLuong!: number;
}
