import { Controller, Get, Query, Req } from '@nestjs/common';
import { OperatorService } from './operator.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';
import { Request } from 'express';

@ApiTags('Operator')
@ApiBearerAuth()
@Controller('operator')
export class OperatorController {
  constructor(private readonly operatorService: OperatorService) {}

  @Roles(ROLE.operator)
  @ApiOperation({ summary: 'Get all operator orders' })
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
    return this.operatorService.findAll(sub, page, limit, search);
  }
}
