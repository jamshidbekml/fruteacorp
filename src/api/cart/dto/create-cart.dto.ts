import { IsDefined, IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class CreateCartDto {
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  price: any;
}

export class RemoveCartDto {
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  productId: string;
}
