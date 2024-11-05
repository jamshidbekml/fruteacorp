import { ApiProperty } from '@nestjs/swagger';
import { Review } from '@prisma/client';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class CreateReviewDto implements Partial<Review> {
  @ApiProperty({
    description: 'Rate, min:1, max:5, default:5',
    required: true,
    type: 'number',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rate: number;

  @ApiProperty({
    description: 'Comment',
    required: false,
    type: 'string',
  })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: 'Product id',
    required: true,
    type: 'uuid',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  productId: string;
}

export class ReplyDto {
  @ApiProperty({
    description: 'Message',
    required: true,
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  message: string;
}
