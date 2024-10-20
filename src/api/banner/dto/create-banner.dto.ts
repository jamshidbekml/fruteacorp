import { Banner } from '@prisma/client';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class CreateBannerDto implements Partial<Banner> {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  link: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  title: string;
}
