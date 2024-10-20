import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ValidatePromoDto {
  @ApiProperty({
    description: `Field to enter promocode`,
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  promocode: string;

  @ApiProperty({
    description: `Field to enter order's amount`,
    required: true,
    type: 'number',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
