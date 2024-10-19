import { PartialType } from '@nestjs/swagger';
import { CreateSubscriptionDto } from './create-subscription.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSubscriptionDto extends PartialType(CreateSubscriptionDto) {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  price?: Decimal;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string;
}
