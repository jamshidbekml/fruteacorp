import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateWishlistDto {
  @ApiProperty({ description: `Field to enter product's id`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID('4')
  productId: string;
}
