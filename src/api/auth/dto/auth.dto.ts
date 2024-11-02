import { ApiProperty } from '@nestjs/swagger';
import { Orders, UserAddress, UserSubscription } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { IsCorrectPhoneNumber } from 'src/api/shared/dto/phone.dto';

export class AuthDto {
  @ApiProperty({ description: `Field to enter user's phone`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsCorrectPhoneNumber({ message: 'Phone number is not correct' })
  phone: string;

  @ApiProperty({
    description: `Field to enter user's password`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class SignupDto {
  @ApiProperty({ description: `Field to enter firstname`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: `Field to enter lastname`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: `Field to enter user's phone`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsCorrectPhoneNumber({ message: 'Phone number is not correct' })
  phone: string;

  @ApiProperty({
    description: `Field to enter user's password`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: `Field to enter user's password`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: `Field to enter code`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @Length(5, 5, { message: 'Code must be 5 characters long' })
  code: string;

  @ApiProperty({ description: `Field to enter user's phone`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsCorrectPhoneNumber({ message: 'Phone number is not correct' })
  phone: string;
}

export class PhoneDto {
  @ApiProperty({ description: `Field to enter user's phone`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @IsCorrectPhoneNumber({ message: 'Phone number is not correct' })
  phone: string;
}

export class GetMeDto {
  @Expose()
  id: string;

  @Expose()
  role: string;

  @Expose()
  phone: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  orders: Orders[];

  @Expose()
  addresses: UserAddress[];

  @Expose()
  subscriptions: UserSubscription[];
}
