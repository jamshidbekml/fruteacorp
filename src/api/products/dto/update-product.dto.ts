import { PartialType } from '@nestjs/swagger';
import {
  CreateProductDto,
  ImageDto,
  IsOnlyOneMainImageConstraint,
} from './create-product.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { $Enums } from '@prisma/client';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title_uz?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title_ru?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description_ru?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description_uz?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  amount?: Decimal;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  discountAmount?: Decimal;

  @IsOptional()
  @IsNotEmpty()
  @IsDate()
  discountExpiresAt?: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsEnum($Enums.STATUS)
  discountStatus?: $Enums.STATUS;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Validate(IsOnlyOneMainImageConstraint)
  images?: ImageDto[];
}
