import { ApiProperty } from '@nestjs/swagger';
import { Subscription } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateSubscriptionDto implements Partial<Subscription> {
  @ApiProperty({
    description: 'Subscription title',
    required: true,
    type: 'string',
    example: '3 Oy',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Subscription description',
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Subscription discount after that activated',
    required: true,
    type: 'number',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  discount: number;

  @ApiProperty({
    description: 'Subscription duration in months',
    required: true,
    type: 'number',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: 'Subscription price',
    required: true,
    type: 'number',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  price: Decimal;
}
