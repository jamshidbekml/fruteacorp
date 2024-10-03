import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prismaService: PrismaService) {}

  create(createOrderDto: CreateOrderDto) {
    return 'This action adds a new order';
  }

  async findAll(page: number, limit: number) {
    return await this.prismaService.orders.findMany({
      where: {
        status: { not: 'created' },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        status: true,
        orderItems: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
