import { ApiProperty } from '@nestjs/swagger';
import { OrderProduct, Orders } from '@prisma/client';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateOrderDto implements Partial<Orders> {
  @ApiProperty({
    description: 'Address id',
    required: true,
    type: 'uuid',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  addressId: string;

  @ApiProperty({
    description: 'Cart id',
    required: true,
    type: 'uuid',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  cartId: string;

  @ApiProperty({
    description: 'Cart id',
    required: false,
    type: 'uuid',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsUUID()
  promoCodeId?: string;

  @ApiProperty({
    description: 'Delivery info',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  deliveryInfo?: string;
}

export class OrderProductDto implements Partial<OrderProduct> {}
