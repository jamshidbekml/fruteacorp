import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateCartDto {
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  count: number;
}

export class RemoveCartDto {
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsOptional()
  @IsNotEmpty()
  @IsNumber()
  count: number;
}
