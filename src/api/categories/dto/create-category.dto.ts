import { Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
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

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  en: string;
}

export class CreateCategoryDto {
  @ValidateNested()
  @Type(() => TitleDto)
  @IsNotEmpty()
  title: TitleDto;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  parentId?: string;
}
