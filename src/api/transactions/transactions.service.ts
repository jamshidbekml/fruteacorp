import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(page: number, limit: number, search?: string) {
    const data = await this.prismaService.transactions.findMany({
      where: {
        ...(search
          ? {
              OR: [
                {
                  order: {
                    User: {
                      firstName: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
                {
                  order: {
                    User: {
                      lastName: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
                {
                  order: {
                    User: {
                      phone: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        amount: true,
        status: true,
        performTime: true,
        cancelTime: true,
        updatedAt: true,
        state: true,
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const total = await this.prismaService.transactions.count({
      where: {
        ...(search
          ? {
              OR: [
                {
                  order: {
                    User: {
                      firstName: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
                {
                  order: {
                    User: {
                      lastName: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
                {
                  order: {
                    User: {
                      phone: { contains: search, mode: 'insensitive' },
                    },
                  },
                },
              ],
            }
          : {}),
      },
    });

    return { data, pageSize: limit, current: page, total };
  }
}
