import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Ordering, Sorting } from '../shared/enums';

@Injectable()
export class DashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  async getCurrentMonthStatistics() {
    try {
      const receivedMoney = await this.prismaService.orders.groupBy({
        by: ['paymentType'],
        _sum: {
          totalAmount: true,
        },
        where: {
          status: {
            in: ['paid', 'onway', 'delivered'],
          },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // start of current month
            lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1,
            ), // start of next month
          },
        },
      });

      const sold = await this.prismaService.orders.aggregate({
        _count: {
          id: true,
        },
        where: {
          status: { in: ['paid', 'delivered', 'onway'] },
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1,
            ),
          },
        },
      });

      const cancelled = await this.prismaService.orders.aggregate({
        _count: {
          id: true,
        },
        where: {
          status: 'cancelled',
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            lt: new Date(
              new Date().getFullYear(),
              new Date().getMonth() + 1,
              1,
            ),
          },
        },
      });

      return {
        received: receivedMoney.reduce((acc, curr) => {
          acc[curr.paymentType] = curr._sum.totalAmount;
          return acc;
        }, {}),
        sold: sold._count.id ?? 0,
        cancelled: cancelled._count.id ?? 0,
      };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err);
    }
  }

  async getStatistics(fromDate?: Date, toDate?: Date) {
    try {
      // Default to the current month if no dates are provided
      const start = fromDate
        ? new Date(fromDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = toDate
        ? new Date(toDate)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date range provided.');
      }

      // Initialize an array to hold daily statistics
      const dailyStatistics = [];

      // Loop through each day in the specified range
      for (
        let date = new Date(start);
        date < end;
        date.setDate(date.getDate() + 1)
      ) {
        const nextDay = new Date(date);
        nextDay.setDate(date.getDate() + 1);

        // Get received money grouped by paymentType for the day
        const receivedMoney = await this.prismaService.orders.groupBy({
          by: ['paymentType'],
          _sum: {
            totalAmount: true,
          },
          where: {
            status: { in: ['paid', 'onway', 'delivered'] },
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });

        // Count of sold orders for the day
        const sold = await this.prismaService.orders.aggregate({
          _count: {
            id: true,
          },
          where: {
            status: { in: ['paid', 'delivered', 'onway'] },
            createdAt: {
              gte: date,
              lt: nextDay,
            },
          },
        });

        // Format results for the current day and add to dailyStatistics array
        dailyStatistics.push({
          date: date.toDateString(),
          received: receivedMoney.reduce((acc, curr) => {
            acc[curr.paymentType] = curr._sum.totalAmount;
            return acc;
          }, {}),
          sold: sold._count.id ?? 0,
        });
      }

      return dailyStatistics;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async getTodayStatistics() {
    try {
      const today = new Date();
      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1,
      );

      const receivedMoney = await this.prismaService.orders.groupBy({
        by: ['paymentType'],
        _sum: {
          totalAmount: true,
        },
        where: {
          status: {
            in: ['paid', 'onway', 'delivered'],
          },
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const delivered = await this.prismaService.orders.aggregate({
        _count: {
          id: true,
        },
        where: {
          status: 'delivered',
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const paid = await this.prismaService.orders.aggregate({
        _count: {
          id: true,
        },
        where: {
          status: 'paid',
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const pending = await this.prismaService.orders.aggregate({
        _count: {
          id: true,
        },
        where: {
          status: { in: ['pending_payment', 'created'] },
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const cancelled = await this.prismaService.orders.aggregate({
        _count: {
          id: true,
        },
        where: {
          status: 'cancelled',
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      const onway = await this.prismaService.orders.aggregate({
        _count: {
          id: true,
        },
        where: {
          status: 'onway',
          createdAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });

      return {
        delivered: delivered._count.id ?? 0,
        pending: pending._count.id ?? 0,
        cancelled: cancelled._count.id ?? 0,
        onway: onway._count.id ?? 0,
        paid: paid._count.id ?? 0,
        received: receivedMoney.reduce((acc, curr) => {
          acc[curr.paymentType] = curr._sum.totalAmount;
          return acc;
        }, {}),
      };
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async products(
    sorting: Sorting,
    ordering: Ordering,
    page: number,
    regionId?: string,
  ) {
    try {
      if (regionId) {
        switch (sorting) {
          case 'rating': {
            const offset = (page - 1) * 12;
            const sortOrder = ordering == Ordering.asc ? 'ASC' : 'DESC';
            const products = await this.prismaService.$queryRawUnsafe(`
              SELECT p.id, p.title_uz, p.title_ru, p."inStock", p.sold, p.active, COALESCE(ROUND(AVG(r.rate), 2), 0) AS totalRating
              FROM products AS p
              LEFT JOIN (
                  SELECT DISTINCT op."productId"
                  FROM order_products AS op
                  JOIN orders AS o ON op."orderId" = o.id
                  JOIN user_address AS ua ON o."addressId" = ua.id
                  WHERE ua."deliveryAreaId" = '${regionId}'
              ) AS filtered_orders ON p.id = filtered_orders."productId"
              LEFT JOIN reviews AS r ON p.id = r."productId"
              WHERE filtered_orders."productId" IS NOT NULL
              GROUP BY p.id
              ORDER BY totalRating ${sortOrder}
              LIMIT ${12} OFFSET ${offset}
            `);

            const count = await this.prismaService.$queryRawUnsafe(`
              SELECT CAST(COUNT(DISTINCT p.id) AS INT) AS total
              FROM products AS p
              LEFT JOIN (
                  SELECT DISTINCT op."productId"
                  FROM order_products AS op
                  JOIN orders AS o ON op."orderId" = o.id
                  JOIN user_address AS ua ON o."addressId" = ua.id
                  WHERE ua."deliveryAreaId" = '${regionId}'
              ) AS filtered_orders ON p.id = filtered_orders."productId"
              WHERE filtered_orders."productId" IS NOT NULL
            `);

            return {
              data: products,
              total: count[0].total,
              pageSize: 12,
              current: page,
            };
          }
          case 'mostSold': {
            const offset = (page - 1) * 12;
            const sortOrder = ordering == Ordering.asc ? 'ASC' : 'DESC';
            const products = await this.prismaService.$queryRawUnsafe(`
              SELECT p.id, p.title_uz, p.title_ru, p."inStock", p.sold, p.active, COALESCE(ROUND(AVG(r.rate), 2), 0) AS totalRating
              FROM products AS p
              LEFT JOIN (
                  SELECT DISTINCT op."productId"
                  FROM order_products AS op
                  JOIN orders AS o ON op."orderId" = o.id
                  JOIN user_address AS ua ON o."addressId" = ua.id
                  WHERE ua."deliveryAreaId" = '${regionId}'
              ) AS filtered_orders ON p.id = filtered_orders."productId"
              LEFT JOIN reviews AS r ON p.id = r."productId"
              WHERE filtered_orders."productId" IS NOT NULL
              GROUP BY p.id
              ORDER BY p.sold ${sortOrder}
              LIMIT ${12} OFFSET ${offset}
            `);

            const count = await this.prismaService.$queryRawUnsafe(`
              SELECT CAST(COUNT(DISTINCT p.id) AS INT) AS total
              FROM products AS p
              LEFT JOIN (
                  SELECT DISTINCT op."productId"
                  FROM order_products AS op
                  JOIN orders AS o ON op."orderId" = o.id
                  JOIN user_address AS ua ON o."addressId" = ua.id
                  WHERE ua."deliveryAreaId" = '${regionId}'
              ) AS filtered_orders ON p.id = filtered_orders."productId"
              WHERE filtered_orders."productId" IS NOT NULL
            `);

            return {
              data: products,
              total: count[0].total,
              pageSize: 12,
              current: page,
            };
          }
        }
      } else {
        switch (sorting) {
          case 'rating': {
            const offset = (page - 1) * 12;
            const sortOrder = ordering == Ordering.asc ? 'ASC' : 'DESC';
            const products = await this.prismaService.$queryRawUnsafe(`
              SELECT p.id, p.title_uz, p.title_ru, p."inStock", p.sold, p.active, COALESCE(ROUND(AVG(r.rate), 2), 0) AS totalRating
              FROM products AS p
              LEFT JOIN reviews AS r ON p.id = r."productId"
              GROUP BY p.id
              ORDER BY totalRating ${sortOrder}
              LIMIT ${12} OFFSET ${offset}
            `);

            const total = await this.prismaService.products.count();
            return {
              data: products,
              total,
              pageSize: 12,
              current: page,
            };
          }
          case 'mostSold': {
            const sortOrder = ordering == Ordering.asc ? 'asc' : 'desc';

            const products = await this.prismaService.products.findMany({
              orderBy: { sold: sortOrder },
              skip: (page - 1) * 12,
              take: 12,
            });

            const total = await this.prismaService.products.count();
            return {
              data: products,
              total,
              pageSize: 12,
              current: page,
            };
          }
        }
      }
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException();
    }
  }

  async userOrders(
    page: number,
    limit: number,
    fromDate?: Date,
    toDate?: Date,
  ) {
    try {
      const start = fromDate
        ? new Date(fromDate)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = toDate
        ? new Date(toDate)
        : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date range provided.');
      }

      const users = await this.prismaService.$queryRaw`
        WITH product_details AS (
          SELECT 
            op."orderId",
            jsonb_build_object(
              'productId', op."productId",
              'title_uz', op.title_uz,
              'title_ru', op.title_ru,
              'quantity', op.quantity,
              'amount', op.amount
            ) AS product
          FROM order_products AS op
        )
        SELECT 
          u.id,
          u."firstName",
          u."lastName",
          u.role,
          u.phone,
          CAST(COUNT(o.id) AS INT) AS orderCount,
          COALESCE(
            array_agg(
              jsonb_build_object(
                'orderId', o.id,
                'status', o.status,
                'totalAmount', o."totalAmount",
                'createdAt', o."createdAt",
                'deliveryPrice', o."deliveryPrice",
                'products', 
                COALESCE(
                  (SELECT jsonb_agg(pd.product) FROM product_details pd WHERE pd."orderId" = o.id), 
                  '[]'::jsonb
                )
              )
            ) FILTER (WHERE o.id IS NOT NULL), ARRAY[]::jsonb[]
          ) AS orders
        FROM users AS u
        LEFT JOIN orders AS o
          ON o."userId" = u.id
          AND o."createdAt" BETWEEN ${start} AND ${end}
          AND o.status IN ('paid', 'onway', 'delivered')
        GROUP BY u.id, u."firstName", u."lastName", u."phone"
        ORDER BY orderCount DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit};
      `;

      const count = await this.prismaService.$queryRaw`
        SELECT 
          CAST(COUNT(DISTINCT u.id) AS INT) AS total
        FROM users AS u
        LEFT JOIN orders AS o
          ON o."userId" = u.id
          AND o."createdAt" BETWEEN ${start} AND ${end}
          AND o.status IN ('paid', 'onway', 'delivered');
      `;

      return {
        data: users,
        total: count[0].total,
        pageSize: limit,
        current: page,
      };
    } catch (err) {
      console.error('Error fetching user orders:', err);
      throw new InternalServerErrorException();
    }
  }
}
