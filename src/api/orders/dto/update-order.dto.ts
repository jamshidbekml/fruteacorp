import { ApiProperty } from '@nestjs/swagger';
import { $Enums, Orders } from '@prisma/client';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateOrderDto implements Partial<Orders> {
  @ApiProperty({
    description: 'Order status',
    required: true,
    enum: $Enums.ORDER_STATUS,
    type: 'string',
    example: $Enums.ORDER_STATUS.onway,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum($Enums.ORDER_STATUS)
  status: $Enums.ORDER_STATUS;

  @ApiProperty({
    description: 'Extra info',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  extraInfo?: string;
}
