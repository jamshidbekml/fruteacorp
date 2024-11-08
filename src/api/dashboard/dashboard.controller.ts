import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';

@ApiTags('Dashboard')
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
}
