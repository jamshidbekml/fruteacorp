import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdatePackmanDto {
  @ApiProperty({
    description: `Field to enter status`,
    required: false,
    enum: $Enums.ORDER_PACKMAN_STATUS,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @IsEnum($Enums.ORDER_PACKMAN_STATUS)
  status?: $Enums.ORDER_PACKMAN_STATUS;

  @ApiProperty({
    description: `Field to enter deliveryInfo`,
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  deliveryInfo?: string;
}
