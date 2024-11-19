import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateAreaDto } from './create-area.dto';
import { Decimal } from '@prisma/client/runtime/library';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateAreaDto extends PartialType(CreateAreaDto) {
  @ApiProperty({
    description: 'Area name UZ. is must be unique',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  areaUZ?: string;

  @ApiProperty({
    description: 'Area name RU. is must be unique',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  areaRU?: string;

  @ApiProperty({
    description: 'Area name RU. is must be unique',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  areaEN?: string;

  @ApiProperty({
    description: 'Delivery price',
    required: false,
    type: 'number',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  deliveryPrice?: Decimal;

  @ApiProperty({
    description: 'Free delivery',
    required: false,
    type: 'boolean',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  freeDelivery?: boolean;
}
