import { ApiProperty, PartialType } from '@nestjs/swagger';
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
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
} from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: `Field to enter product's title`,
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title_uz?: string;

  @ApiProperty({
    description: `Field to enter product's title`,
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title_ru?: string;

  @ApiProperty({
    description: `Field to enter product's description`,
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description_ru?: string;

  @ApiProperty({
    description: `Field to enter product's description`,
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description_uz?: string;

  @ApiProperty({
    description: `Field to enter product's price`,
    required: false,
    type: 'number',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  amount?: Decimal;

  @ApiProperty({
    description: `Field to enter product's active status`,
    required: false,
    type: 'boolean',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: `Field to enter product's category`,
    required: false,
    type: 'string',
    format: 'uuid',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: `Field to enter product's discount amount`,
    required: false,
    type: 'number',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  discountAmount?: Decimal;

  @ApiProperty({
    description: `Field to enter product's discount expires at`,
    required: false,
    type: 'string',
    format: 'date',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumberString()
  discountExpiresAt?: Date;

  @ApiProperty({
    description: `Field to enter product's discount status`,
    required: false,
    enum: $Enums.STATUS,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum($Enums.STATUS)
  discountStatus?: $Enums.STATUS;

  @ApiProperty({
    description: `Field to enter product's images`,
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        isMain: {
          type: 'boolean',
        },
        id: {
          type: 'string',
          format: 'uuid',
        },
      },
    },
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @Validate(IsOnlyOneMainImageConstraint)
  images?: ImageDto[];

  @ApiProperty({
    description: `Field to enter product's stock`,
    required: false,
    type: 'number',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  stock?: number;
}
