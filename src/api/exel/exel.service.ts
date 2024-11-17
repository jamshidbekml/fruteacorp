import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExelService {
  constructor(private readonly prismaService: PrismaService) {}

  async importOrders(startDate: Date, endDate: Date) {
    const result = [];

    const data = await this.prismaService.orderProduct.findMany({
      where: {
        Order: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          status: {
            in: ['paid', 'onway', 'delivered'],
          },
        },
      },
      select: {
        Order: {
          select: {
            orderNumber: true,
            paymentType: true,
            createdAt: true,
            User: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            promoCode: true,
            status: true,
          },
        },
        title_ru: true,
        quantity: true,
        amount: true,
      },
    });

    if (data.length > 0) {
      for (const item of data) {
        result.push([
          item.Order.createdAt.toISOString().split('T')[0],
          item.Order.createdAt.toTimeString().split(' ')[0],
          item.Order.orderNumber,
          item.title_ru,
          item.quantity,
          Number(item.amount),
          item.Order.paymentType,
          item.Order.promoCode,
          item.Order.User.firstName + ' ' + item.Order.User.lastName,
          item.Order.User.phone,
          item.Order.status,
        ]);
      }
    }

    return result;
  }

  async importUsers() {
    const result = [];

    const data: {
      user_name: string;
      phone: string;
      count: number;
      total: number;
      region: string | null;
    }[] = await this.prismaService.$queryRaw`
      SELECT 
          u.id,
          CONCAT(u."firstName", ' ', u."lastName") AS user_name,
          u.phone AS phone,
          CAST(COALESCE(COUNT(o.id), 0) AS INT) AS count,
          CAST(COALESCE(SUM(o."totalAmount"), 0) AS DECIMAL(10, 2)) AS total,
          a."areaRU" as region
      FROM
          users u
      LEFT JOIN 
          orders o ON u.id = o."userId" AND o.status IN ('paid', 'onway', 'delivered')
      LEFT JOIN 
          user_address ua ON o."addressId" = ua.id
      LEFT JOIN 
          areas a ON ua."deliveryAreaId" = a.id
      GROUP BY 
          u.id, u.phone, u."firstName", u."lastName", a."areaRU"
      ORDER BY 
          total DESC;
    `;

    if (data && data.length > 0) {
      for (const item of data) {
        result.push([
          item.user_name,
          item.phone,
          item.count,
          Number(item.total),
          item.region || '-',
        ]);
      }
    }

    return result;
  }
}
