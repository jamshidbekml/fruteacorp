import { Controller, Get, UseInterceptors, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('Transactions')
@Controller('transactions')
@UseInterceptors(TransformInterceptor)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @Roles(ROLE.superadmin)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.transactionsService.findAll(page, limit, search);
  }
}
