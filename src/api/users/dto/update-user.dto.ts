import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { $Enums } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: `Field to enter user's role. Default value: 'user'`,
    required: false,
    enum: $Enums.ROLE,
  })
  @IsOptional()
  @IsNotEmpty()
  @IsEnum($Enums.ROLE)
  role?: $Enums.ROLE;

  @ApiProperty({ description: `Field to enter firstname`, required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: `Field to enter lastname`, required: false })
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  refreshToken?: string;
}
