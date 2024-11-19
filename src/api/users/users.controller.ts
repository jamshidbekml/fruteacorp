import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseInterceptors,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ROLE } from '@prisma/client';
import { Serialize } from '../interceptors/serialize.interceptor';
import { UserDto } from './dto/user.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { Request } from 'express';
import { NestedSerialize } from '../interceptors/nested-serialize.interceptor';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { CreateUserDto } from './dto/create-user.dto';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('users')
@UseInterceptors(TransformInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(ROLE.superadmin)
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Create User' })
  @ApiBody({ type: CreateUserDto })
  @Post('employee')
  create(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Roles(ROLE.superadmin)
  @NestedSerialize(UserDto)
  @ApiOperation({ summary: 'Get All Users' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.usersService.findAll(+page, +limit, search);
  }

  @Roles(ROLE.superadmin)
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Get User By Id' })
  @ApiParam({ name: 'id', type: String })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findByid(id);
  }

  @Serialize(UserDto)
  @ApiOperation({ summary: 'Self Update User' })
  @Patch('self')
  selfUpdate(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const { sub } = req['user'] as { sub: string };

    return this.usersService.update(sub, {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
    });
  }

  @Roles(ROLE.superadmin)
  @Serialize(UserDto)
  @ApiOperation({ summary: 'Update User' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({
    type: UpdateUserDto,
  })
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const { role, sub } = req['user'] as { role: ROLE; sub: string };
    return this.usersService.update(id, updateUserDto, role, sub);
  }

  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Delete User' })
  @ApiParam({ name: 'id', type: String })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
