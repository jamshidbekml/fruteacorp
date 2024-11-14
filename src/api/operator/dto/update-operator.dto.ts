import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateOperatorDto {
  @ApiProperty({
    description: `Field to enter status`,
    required: false,
    enum: $Enums.ORDER_OPERATOR_STATUS,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum($Enums.ORDER_OPERATOR_STATUS)
  status?: $Enums.ORDER_OPERATOR_STATUS;

  @ApiProperty({
    description: `Field to enter extarInfo`,
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  extarInfo?: string;
}
