import { PartialType } from '@nestjs/swagger';
import { CreateBannerDto } from './create-banner.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBannerDto extends PartialType(CreateBannerDto) {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  link?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string;
}
