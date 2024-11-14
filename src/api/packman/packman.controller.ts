import { Controller, Get, Query, Req } from '@nestjs/common';
import { PackmanService } from './packman.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Packman')
@ApiBearerAuth()
@Controller('packman')
export class PackmanController {
  constructor(private readonly packmanService: PackmanService) {}

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
}
