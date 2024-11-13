import { PrismaService } from 'src/api/prisma/prisma.service';
import Keyboards from '../assets/keyboard';
import { Injectable } from '@nestjs/common';
import { Keyboard } from 'grammy';
import messages from '../assets/messages';

@Injectable()
export default class BotService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserOrders(chatId: number, ctx: any, page?: number) {
    const user = await this.prismaService.users.findUnique({
      where: {
        telegramId: String(chatId),
      },
    });

    if (user.role === 'operator') {
      const orders = await this.prismaService.orders.findMany({
        where: {
          operatorId: user.id,
        },
        select: {
          User: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          status: true,
        },
        take: 5,
        skip: page ? (page - 1) * 5 : 0,
      });

      const orderCounts = await this.prismaService.orders.groupBy({
        by: ['operatorStatus'],
        where: {
          operatorId: user.id,
        },
        _count: {
          id: true,
        },
      });

      console.log(orderCounts);

      const total = await this.prismaService.orders.count({
        where: {
          operatorId: user.id,
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

      console.log({
        received,
        confirmed,
        total,
      });
    } else if (user.role === 'packman') {
    }
  }

  async sendUserdata(chatId: number, ctx: any) {
    try {
      const user = await this.prismaService.users.findUnique({
        where: {
          telegramId: String(chatId),
        },
      });

      if (!user) return ctx.reply(`⚠️ Noma'lum xatolik yuz berdi.`);

      ctx.reply(messages.user_data(user), {
        parse_mode: 'HTML',
      });
    } catch (err) {
      console.log(err);
    }
  }

  async setOrderToOperator(orderId: string, chatId: number, ctx: any) {
    const user = await this.prismaService.users.findUnique({
      where: {
        telegramId: String(chatId),
      },
    });

    const order = await this.prismaService.orders.findUnique({
      where: { id: orderId },
      select: {
        Operator: true,
      },
    });

    if (order.Operator)
      return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
        text: `❗️ Bu buyurtma allaqachon olingan!`,
      });

    await this.prismaService.orders.update({
      where: { id: orderId },
      data: {
        operatorId: user.id,
        operatorStatus: 'received',
      },
    });

    return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
      text: `✅ Buyurtma muvaffaqiyatli olindi!`,
    });
  }
}
