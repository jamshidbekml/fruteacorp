import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePackmanDto } from './dto/update-packman.dto';

@Injectable()
export class PackmanService {
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
        packmanId: userId,
      },
      orderBy: {
        packmanReceivedAt: 'desc',
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const orderCounts = await this.prismaService.orders.groupBy({
      by: ['packmanStatus'],
      where: {
        packmanId: userId,
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
        packmanId: userId,
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
        ? orderCounts.find((item) => item.packmanStatus === 'received')
          ? orderCounts.find((item) => item.packmanStatus === 'received')._count
              .id
          : 0
        : 0;

    const onway =
      orderCounts.length > 0
        ? orderCounts.find((item) => item.packmanStatus === 'onway')
          ? orderCounts.find((item) => item.packmanStatus === 'onway')._count.id
          : 0
        : 0;

    const delivered =
      orderCounts.length > 0
        ? orderCounts.find((item) => item.packmanStatus === 'delivered')
          ? orderCounts.find((item) => item.packmanStatus === 'delivered')
              ._count.id
          : 0
        : 0;

    return {
      data: orders,
      total,
      received,
      onway,
      delivered,
      pageSize: limit,
      current: page,
    };
  }

  async update(userId: string, orderId: string, data: UpdatePackmanDto) {
    const order = await this.prismaService.orders.findUnique({
      where: { id: orderId, packmanId: userId },
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
        packmanStatus: data.status || order.packmanStatus,
        deliveryInfo: data.deliveryInfo || order.deliveryInfo,
      },
    });

    if (data.status === 'onway' && order.status !== 'onway') {
      await this.prismaService.orders.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'onway',
        },
      });
    } else if (data.status === 'delivered' && order.status !== 'delivered') {
      await this.prismaService.orders.update({
        where: {
          id: order.id,
        },
        data: {
          status: 'delivered',
          packmanDeliveredAt: new Date(),
        },
      });
    }

    return 'Buyurtma muvaffaqiyatli o`zgartirildi!';
  }

  async findOne(userId: string, orderId: string) {
    const order = await this.prismaService.orders.findUnique({
      where: { id: orderId, packmanId: userId },
      select: {
        items: {
          include: {
            Product: true,
          },
        },
        User: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        Packman: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
        packmanStatus: true,
        Address: {
          select: {
            deliveryArea: {
              select: {
                areaEN: true,
                areaRU: true,
                areaUZ: true,
              },
            },
            streetName: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Buyurtma topilmadi!');

    return order;
  }
}
