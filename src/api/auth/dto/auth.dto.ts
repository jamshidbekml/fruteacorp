import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsDefined, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @ApiProperty({ description: `Field to enter user's phone`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
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

export class GetMeDto {
  @Expose()
  id: string;

  @Expose()
  username: string;

  @Expose()
  role: string;

  @Expose()
  phone: string;
}
