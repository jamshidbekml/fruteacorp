import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  Query,
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { TransformInterceptor } from '../interceptors/transform.interceptor';
import { $Enums, ROLE } from '@prisma/client';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/role.decorator';

@ApiBearerAuth()
@Controller('orders')
@ApiTags('Buyurtmalar')
@UseInterceptors(TransformInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Buyurtma yaratish' })
  @ApiBody({ type: CreateOrderDto })
  create(@Req() req: Request, @Body() createOrderDto: CreateOrderDto) {
    const { sub } = req['user'] as { sub: string };

    return this.ordersService.create(createOrderDto, sub);
  }

  @Get()
  @ApiOperation({ summary: 'Buyurtmalar ro`yxati' })
  @ApiQuery({ name: 'page', type: 'number', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({
    name: 'status',
    type: 'string',
    enum: $Enums.ORDER_STATUS,
    required: true,
  })
  @Roles(ROLE.superadmin, ROLE.operator)
  @ApiQuery({ name: 'search', type: 'string', required: false })
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('status') status: $Enums.ORDER_STATUS = $Enums.ORDER_STATUS.created,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll(page, limit, status, search);
  }

  @Get(':id')
  @Roles(ROLE.superadmin, ROLE.operator)
  @ApiOperation({ summary: 'Buyurtma haqida ma`lumotlarni olish' })
  @ApiParam({ name: 'id', type: 'string', required: true })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @Roles(ROLE.superadmin, ROLE.operator)
  @ApiOperation({ summary: 'Buyurtma o`zgartirish' })
  @ApiParam({ name: 'id', type: 'string', required: true })
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Delete(':id')
  @Roles(ROLE.superadmin)
  @ApiParam({ name: 'id', type: 'string', required: true })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
