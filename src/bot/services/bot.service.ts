import { PrismaService } from 'src/api/prisma/prisma.service';
import messages from '../assets/messages';

export default class BotService {
  private prismaService = new PrismaService();

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
        operatorReceivedAt: new Date(),
      },
    });

    return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
      text: `✅ Buyurtma muvaffaqiyatli olindi!`,
    });
  }

  async setOrderToPackman(orderId: string, chatId: number, ctx: any) {
    const user = await this.prismaService.users.findUnique({
      where: {
        telegramId: String(chatId),
      },
    });

    const order = await this.prismaService.orders.findUnique({
      where: { id: orderId },
      select: {
        Packman: true,
      },
    });

    if (order.Packman)
      return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
        text: `❗️ Bu buyurtma allaqachon olingan!`,
      });

    await this.prismaService.orders.update({
      where: { id: orderId },
      data: {
        packmanId: user.id,
        packmanStatus: 'received',
        packmanReceivedAt: new Date(),
      },
    });

    return await ctx.api.answerCallbackQuery(ctx.callbackQuery.id, {
      text: `✅ Buyurtma muvaffaqiyatli olindi!`,
    });
  }
}
