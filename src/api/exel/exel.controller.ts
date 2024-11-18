import { Controller, Get, Query, Res } from '@nestjs/common';
import { ExelService } from './exel.service';
import * as XLSX from 'xlsx';
import { Response } from 'express';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';
import { ROLE } from '@prisma/client';

@ApiBearerAuth()
@ApiTags('Export exel report')
@Controller('exel')
export class ExelController {
  constructor(private readonly exelService: ExelService) {}

  @ApiOperation({ summary: 'Отчет по ЗАКАЗам' })
  @ApiQuery({
    name: 'fromDate',
    type: 'string',
    required: false,
    description: 'Начало периода',
  })
  @ApiQuery({
    name: 'toDate',
    type: 'string',
    required: false,
    description: 'Конец периода',
  })
  @Roles(ROLE.superadmin)
  @Get('/orders')
  async importOrders(
    @Res() res: Response,
    @Query('fromDate') fromDate,
    @Query('toDate') toDate,
  ) {
    const start = fromDate
      ? new Date(fromDate)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = toDate
      ? new Date(toDate)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

    const data = await this.exelService.importOrders(start, end);

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      [
        'Дата',
        'Время',
        '№ заказа',
        'Наименования товар',
        'Количество',
        'сумма',
        'форма оплаты',
        'Промокод',
        'ФИО',
        'Номер телефона',
        'Статус',
      ],
      ,
      ...data,
    ]);

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent('Отчет по ЗАКАЗам.xlsx')}`,
    );

    res.send(buffer);
  }

  @ApiOperation({ summary: 'Отчет по клиентам' })
  @Roles(ROLE.superadmin)
  @Get('/users')
  async importUsers(@Res() res: Response) {
    const data = await this.exelService.importUsers();

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      [
        '№ клиента',
        'ФИО',
        'Номер телефона',
        'Количество заказов',
        'Общая сумма',
        'Регион',
      ],
      ,
      ...data,
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent('БАЗА_Отчет по клиентам.xlsx')}`,
    );

    res.send(buffer);
  }

  @ApiOperation({ summary: 'Продажи товаров за период' })
  @ApiQuery({
    name: 'fromDate',
    type: 'string',
    required: false,
    description: 'Начало периода',
  })
  @ApiQuery({
    name: 'toDate',
    type: 'string',
    required: false,
    description: 'Конец периода',
  })
  @Roles(ROLE.superadmin)
  @Get('products')
  async retrieveProductSalesForPeriod(
    @Res() res: Response,
    @Query('fromDate') fromDate,
    @Query('toDate') toDate,
  ) {
    const data = await this.exelService.retrieveProductSalesForPeriod(
      fromDate,
      toDate,
    );

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      [
        '№',
        'Наименование товара',
        'Период продажи',
        'Кол-во проданных штук',
        'Сумма продаж за период',
      ],
      ...data,
    ]);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodeURIComponent('Продажи товаров за период.xlsx')}`,
    );

    res.send(buffer);
  }
}
