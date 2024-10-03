import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';

export class TitleDto {
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  uz: string;

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  ru: string;
}

export class CreateCategoryDto {
  @ValidateNested()
  @Type(() => TitleDto)
  @IsNotEmpty()
  title: TitleDto;
}
