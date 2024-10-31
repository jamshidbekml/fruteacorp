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
    description: 'Area name',
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  area: string;

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
    description: 'Free delivery (default: false)',
    required: false,
    type: 'boolean',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  freeDelivery?: boolean;
}
