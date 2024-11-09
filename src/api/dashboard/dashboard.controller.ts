import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';
import { Ordering, Sorting } from '../shared/enums';
import { TransformInterceptor } from '../interceptors/transform.interceptor';

@ApiTags('Dashboard')
@UseInterceptors(TransformInterceptor)
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Get current month statistics' })
  getCurrentMonthStatistics() {
    return this.dashboardService.getCurrentMonthStatistics();
  }

  @Get('/statistics')
  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Get statistics' })
  @ApiQuery({ name: 'fromDate', required: false })
  @ApiQuery({ name: 'toDate', required: false })
  getStatistics(@Query('fromDate') fromDate, @Query('toDate') toDate) {
    return this.dashboardService.getStatistics(fromDate, toDate);
  }

  @Get('/today')
  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Get today statistics' })
  getTodayStatistics() {
    return this.dashboardService.getTodayStatistics();
  }

  @Get('/products')
  @Roles(ROLE.superadmin)
  @ApiOperation({ summary: 'Get products' })
  @ApiQuery({ name: 'sorting', required: false, enum: Sorting })
  @ApiQuery({ name: 'ordering', required: false, enum: Ordering })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'regionId', required: false, type: String })
  getProducts(
    @Query('sorting') sorting: Sorting,
    @Query('ordering') ordering: Ordering,
    @Query('page') page = 1,
    @Query('regionId') regionId?: string,
  ) {
    return this.dashboardService.products(sorting, ordering, +page, regionId);
  }
}
