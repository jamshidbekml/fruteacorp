import { ApiProperty } from '@nestjs/swagger';
import { UserAddress } from '@prisma/client';
import {
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAddressDto implements Partial<UserAddress> {
  @ApiProperty({
    description: 'Street name',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  streetName: string;

  @ApiProperty({
    description: 'latitude',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  lat: string;

  @ApiProperty({
    description: 'longitude',
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  long: string;

  @ApiProperty({
    description: 'Delivery area id',
    required: true,
    type: 'uuid',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID('4')
  deliveryAreaId?: string;

  @ApiProperty({
    description: 'House entry code',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  houseEntryCode?: string;

  @ApiProperty({
    description: 'House line',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  houseLine?: string;

  @ApiProperty({
    description: 'House number',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  houseNumber?: string;

  @ApiProperty({
    description: 'House stage',
    required: false,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  houseStage?: string;
}
