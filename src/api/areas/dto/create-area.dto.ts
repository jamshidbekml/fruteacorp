import { ApiProperty } from '@nestjs/swagger';
import { Areas } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAreaDto implements Partial<Areas> {
  @ApiProperty({
    description: 'Area name UZ. is must be unique',
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  areaUZ: string;

  @ApiProperty({
    description: 'Area name RU. is must be unique',
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  areaRU: string;

  @ApiProperty({
    description: 'Delivery price',
    required: true,
    type: 'number',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  deliveryPrice: Decimal;

  @ApiProperty({
    description: 'Delivery price',
    required: true,
    type: 'number',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  freeDeliveryFrom: Decimal;

  @ApiProperty({
    description: 'Free delivery (default: false)',
    required: false,
    type: 'boolean',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  freeDelivery?: boolean;
}
