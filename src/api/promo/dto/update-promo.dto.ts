import { PartialType } from '@nestjs/swagger';
import { CreatePromoDto } from './create-promo.dto';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdatePromoDto extends PartialType(CreatePromoDto) {
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  activeFrom?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  expiresAt?: Date;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MaxLength(8)
  promocode?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  oneOff?: boolean;
}
