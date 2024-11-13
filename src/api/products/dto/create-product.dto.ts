import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Products } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsOnlyOneMainImage', async: false })
export class IsOnlyOneMainImageConstraint
  implements ValidatorConstraintInterface
{
  validate(images: ImageDto[]) {
    // 'isMain' qiymati true bo'lgan rasmlarni hisoblash
    const mainImages = images.filter((image) => image.isMain);
    return mainImages.length === 1; // Agar faqat bitta bo'lsa true qaytaradi
  }

  defaultMessage() {
    return 'There must be exactly one image with isMain set to true.';
  }
}

export class ImageDto {
  @IsDefined()
  @IsNotEmpty()
  @IsBoolean()
  isMain: boolean;

  @IsDefined()
  @IsNotEmpty()
  @IsUUID('4')
  id: string;
}

export class CreateProductDto implements Partial<Products> {
  @ApiProperty({
    description: `Field to enter product's title`,
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  title_ru: string;

  @ApiProperty({
    description: `Field to enter product's title`,
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  title_uz: string;

  @ApiProperty({
    description: `Field to enter product's category`,
    required: true,
    type: 'string',
    format: 'uuid',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: `Field to enter product's description`,
    required: true,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description_ru?: string;

  @ApiProperty({
    description: `Field to enter product's description`,
    required: true,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description_uz?: string;

  @ApiProperty({
    description: `Field to enter product's description`,
    required: true,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  extraInfoUz?: string;

  @ApiProperty({
    description: `Field to enter product's description`,
    required: true,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  extraInfoRu?: string;

  @ApiProperty({
    description: `Field to enter product's status`,
    type: 'boolean',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: `Field to enter product's price`,
    type: 'number',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  amount?: Decimal;

  @ApiProperty({
    description: `Field to enter product's discount`,
    type: 'number',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  discountAmount?: Decimal;

  @ApiProperty({
    description: `Field to enter product's discount expires at`,
    type: 'string',
    format: 'date-time',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  discountExpiresAt?: Date;

  @ApiProperty({
    description: `Field to enter product's discount status`,
    type: 'enum',
    enum: $Enums.STATUS,
    default: 'inactive',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum($Enums.STATUS)
  discountStatus?: $Enums.STATUS;

  @ApiProperty({
    description: `Field to enter product's images`,
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
  @IsDefined()
  @IsArray()
  @ArrayNotEmpty()
  @Validate(IsOnlyOneMainImageConstraint)
  images: ImageDto[];

  @ApiProperty({
    description: `Field to enter product's quantity`,
    type: 'number',
    default: 0,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  inStock?: number;
}
