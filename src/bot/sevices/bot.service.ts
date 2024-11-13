import { PrismaService } from 'src/api/prisma/prisma.service';
import Keyboards from '../assets/keyboard';
import { Injectable } from '@nestjs/common';
import { Keyboard } from 'grammy';
import messages from '../assets/messages';

@Injectable()
export default class BotService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserOrders(chatId: number, ctx: any) {
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
      },
    });

    return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
      text: `✅ Buyurtma muvaffaqiyatli olindi!`,
    });
  }
}