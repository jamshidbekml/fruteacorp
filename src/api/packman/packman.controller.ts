import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
} from '@nestjs/common';
import { PackmanService } from './packman.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';
import { UpdatePackmanDto } from './dto/update-packman.dto';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';

@ApiTags('Packman')
@ApiBearerAuth()
@Controller('packman')
export class PackmanController {
  constructor(private readonly packmanService: PackmanService) {}

  @Roles(ROLE.packman)
  @ApiOperation({ summary: 'Get All Packman orders' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Get()
  findAll(
    @Req() req: Request,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    const { sub } = req['user'] as { sub: string };

    return this.packmanService.findAll(sub, page, limit, search);
  }

  @Roles(ROLE.packman)
  @ApiOperation({ summary: 'Update Packman order' })
  @ApiParam({ name: 'id' })
  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: UpdatePackmanDto,
  ) {
    const { sub } = req['user'] as { sub: string };
    return this.packmanService.update(sub, id, body);
  }
}
