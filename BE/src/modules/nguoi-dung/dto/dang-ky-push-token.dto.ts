import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class DangKyPushTokenDto {
  @ApiProperty({ description: 'Token do expo-notifications cấp trên thiết bị' })
  @IsString()
  @MinLength(1)
  expoPushToken!: string;
}
