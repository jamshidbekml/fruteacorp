import { ApiProperty } from '@nestjs/swagger';
import { ROLE, Users } from '@prisma/client';
import {
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateUserDto implements Partial<Users> {
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

  @ApiProperty({
    description: `Field to enter user's password`,
    required: true,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ description: `Field to enter user's phone`, required: true })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: `Field to enter user's role. Default value: 'user'`,
    required: false,
    enum: ROLE,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum(ROLE)
  role?: ROLE;
}
