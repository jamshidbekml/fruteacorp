import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOperatorDto } from './dto/update-operator.dto';
import { MyBot } from 'src/bot/bot';

@Injectable()
export class OperatorService {
  private readonly botService = new MyBot();

  constructor(private readonly prismaService: PrismaService) {}

  async findAll(userId: string, page: number, limit: number, search?: string) {
    const orders = await this.prismaService.orders.findMany({
      where: {
        ...(search
          ? {
              OR: [
                {
                  User: {
                    firstName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  User: {
                    lastName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  User: {
                    phone: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            }
          : {}),
        operatorId: userId,
      },
      orderBy: {
        operatorReceivedAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const orderCounts = await this.prismaService.orders.groupBy({
      by: ['operatorStatus'],
      where: {
        operatorId: userId,
        ...(search
          ? {
              OR: [
                {
                  User: {
                    firstName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  User: {
                    lastName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  User: {
                    phone: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            }
          : {}),
      },
      _count: {
        id: true,
      },
    });

    const total = await this.prismaService.orders.count({
      where: {
        operatorId: userId,
        ...(search
          ? {
              OR: [
                {
                  User: {
                    firstName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  User: {
                    lastName: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
                {
                  User: {
                    phone: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                },
              ],
            }
          : {}),
      },
    });

    const received =
      orderCounts.length > 0
        ? orderCounts.find((item) => item.operatorStatus === 'received')
          ? orderCounts.find((item) => item.operatorStatus === 'received')
              ._count.id
          : 0
        : 0;

    const confirmed =
      orderCounts.length > 0
        ? orderCounts.find((item) => item.operatorStatus === 'confirmed')
          ? orderCounts.find((item) => item.operatorStatus === 'confirmed')
              ._count.id
          : 0
        : 0;

    return {
      data: orders,
      total,
      received,
      confirmed,
      pageSize: limit,
      current: page,
    };
  }

  async update(userId: string, orderId: string, data: UpdateOperatorDto) {
    const order = await this.prismaService.orders.findUnique({
      where: { id: orderId, operatorId: userId },
    });

    if (!order)
      throw new NotFoundException(
        'Buyurtma topilmadi yoki sizga tegishli emas!',
      );

    await this.prismaService.orders.update({
      where: {
        id: order.id,
      },
      data: {
        operatorStatus: data.status || order.operatorStatus,
        extraInfo: data.extarInfo || order.extraInfo,
      },
    });

    if (data.status === 'confirmed' && order.operatorStatus !== 'confirmed') {
      this.botService.sendOrderToOperators(order.id);
    }

    return 'Buyurtma muvaffaqiyatli o`zgartirildi!';
  }
}
