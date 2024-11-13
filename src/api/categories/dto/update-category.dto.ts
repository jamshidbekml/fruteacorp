import { PartialType } from '@nestjs/swagger';
import { CreateCategoryDto, TitleDto } from './create-category.dto';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  @ValidateNested()
  @Type(() => TitleDto)
  @IsNotEmpty()
  title?: TitleDto;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  parentId?: string;
}
