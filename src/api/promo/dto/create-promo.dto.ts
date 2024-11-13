import { ApiProperty } from '@nestjs/swagger';
import { PromoCodes } from '@prisma/client';
import {
  IsBoolean,
  IsDateString,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePromoDto implements Partial<PromoCodes> {
  @ApiProperty({
    description: `Prpmokod statusi aktiv yoki yo'q`,
    required: false,
    type: 'boolean',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  active?: boolean;

  @ApiProperty({
    description: `Promokod necha so'mlik buyurtma uchun amal qiladi?`,
    required: false,
    type: 'number',
    example: 50000,
    default: 0,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  activeFrom?: number;

  @ApiProperty({
    description: `Necha so'mlik chegirma beradi yoki %`,
    required: true,
    type: 'number',
    example: 10,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(100)
  discount: number;

  @ApiProperty({
    description: `Promokod tugash sanasi`,
    required: false,
    type: 'date-time',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsDateString()
  expiresAt?: Date;

  @ApiProperty({
    description: `Promokod nomi`,
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MaxLength(8)
  promocode: string;

  @ApiProperty({
    description: `Promokod haqida qisqacha`,
    required: true,
    type: 'string',
    example: `Birinchi zakaz uchun promokod`,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: `Bir martalik promokod mi?`,
    required: false,
    type: 'boolean',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsBoolean()
  oneOff?: boolean;
}
