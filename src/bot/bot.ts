import { Injectable } from '@nestjs/common';
import { Bot, GrammyError, HttpError, session, Keyboard } from 'grammy';
import { Router } from '@grammyjs/router';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/api/prisma/prisma.service';
import { generateRandomNumber } from 'src/api/shared/utils/code-generator';
import { smsSender } from 'src/api/shared/utils/sms-sender';
import Keyboards from './assets/keyboard';
import messages from './assets/messages';
import BotService from './sevices/bot.service';
import InlineKeyboards from './assets/inline-keyboards';

const config = new ConfigService();
const bot = new Bot(config.get<string>('TELEGRAM_BOT_TOKEN'));

@Injectable()
export class MyBot {
  private router;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly botService: BotService,
  ) {
    this.router = new Router((ctx) => ctx['session'].step);

    this.setupMiddleware();
    this.setupCommands();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupCommands() {
    bot.command('start', async (ctx) => {
      console.log(ctx.message);
      await ctx.reply(messages.first_message, {
        reply_markup: Keyboards.contact,
        parse_mode: 'HTML',
      });
      ctx['session'].step = 'send-sms';
    });

    bot.hears(messages.profile, async (ctx) => {
      ctx['session'].step = 'idle';

      const chat_id = ctx.msg.chat.id;

      return await this.botService.sendUserdata(chat_id, ctx);
    });

    bot.on('callback_query:data', async (ctx) => {
      const command = ctx.callbackQuery.data.split('?')[0];

      switch (command) {
        case 'confirm_operator': {
          try {
            const orderId = ctx.callbackQuery.data.split('=')[1];
            return await this.botService.setOrderToOperator(
              orderId,
              ctx.callbackQuery.from.id,
              ctx,
            );
          } catch (err) {
            console.log(err);
          }
        }
        case 'confirm_packman': {
          try {
            const orderId = ctx.callbackQuery.data.split('=')[1];
            return await this.botService.setOrderToOperator(
              orderId,
              ctx.callbackQuery.from.id,
              ctx,
            );
          } catch (err) {
            console.log(err);
          }
        }
      }
    });
  }

  private setupRoutes() {
    this.router.route('send-sms', async (ctx) => {
      const phone = ctx.message.contact?.phone_number;

      if (!phone) {
        ctx.reply(
          `Bot imkoniyatlaridan foydalanish uchun raqamingizni tasdiqlang.`,
          {
            reply_markup: new Keyboard()
              .requestContact('Share Contact')
              .resized(),
            parse_mode: 'HTML',
          },
        );
        ctx['session'].step = 'send-sms';
        return;
      }

      const user = await this.prismaService.users.findUnique({
        where: { phone: Number(phone).toString() },
      });

      if (!user || !['operator', 'packman'].includes(user.role)) {
        await ctx.reply(
          `Bunday raqamli foydalanuvchi topilmadi!\n\n<a href="https://fruteacorp.uz">Fruteacorp</a> platformasi orqali ro'yxatdan o'ting.`,
          {
            reply_markup: { remove_keyboard: true },
            parse_mode: 'HTML',
          },
        );

        ctx['session'].step = 'idle';

        return;
      }

      const code = generateRandomNumber(5);

      const message = `Fruteacorp.uz savdo platformasiga kirish kodi: ${code}. UNI HECH KIMGA AYTMANG. fruteacorp.uz #${code}`;
      await smsSender(Number(user.phone).toString(), message);

      await this.prismaService.users.update({
        where: { id: user.id },
        data: { telegramId: String(ctx.from.id) },
      });

      await this.prismaService.otps.create({
        data: {
          code: code.toString(),
          userId: user.id,
          type: 'bot',
        },
      });

      ctx['session'].step = 'confirm-code';
      return ctx.reply(
        `Sizga tasdiqlash kodi yuborildi!\n\n<b>Tasdiqlash kodini kiriting.</b> 👇`,
        { parse_mode: 'HTML', reply_markup: { remove_keyboard: true } },
      );

      // if (user.role === 'packman') {
      //   await ctx.reply(
      //     `Assalomu alakum ${user.firstName}.\nBu yerda siz yetkazib berish uchun buyurtmalarni qabul qilishingiz mumkin!`,
      //   );
      // }

      // const name = ctx.message.contact.first_name;
      // const message =
      //   `Sizning ismingiz ${name} va telefon raqamingiz ${phone} ga jo` +
      //   'natirilgan.';
      // await ctx.reply(message);
    });

    this.router.route('confirm-code', async (ctx) => {
      const user = await this.prismaService.users.findUnique({
        where: { telegramId: String(ctx.from.id) },
        include: {
          otps: {
            where: {
              type: 'bot',
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      });

      if (!user) return ctx.reply('Bunday foydalanuvchi topilmadi!');

      const otp = user.otps[0];

      if (!otp)
        return ctx.reply(
          "Nomalum xatolik yuz berdi! Iltimis texniklar bilan bog'laning!",
        );

      const requiredWaitTime = 2 * 60 * 1000;
      const currentTime = Date.now();

      if (otp.createdAt < new Date(currentTime - requiredWaitTime))
        return ctx.reply(
          `Nomalum xatolik yuz berdi! Iltimos qaytadan urinib ko'ring!`,
        );

      if (otp.code !== ctx.message.text)
        return ctx.reply(`Tasdiqlash kodi xato kiritldi!`);

      await this.prismaService.users.update({
        where: { id: user.id },
        data: { verified: true },
      });

      ctx.reply(`Tasdiqlash muvaffaqiyatli amalga oshirildi!`, {
        reply_markup: Keyboards.main_menu,
      });

      ctx['session'].step = 'idle';
    });
  }

  private setupMiddleware() {
    bot.use(
      session({
        initial: () => ({
          chat_id: null,
          role: null,
          step: 'idle',
          contact: null,
        }),
      }),
    );

    bot.use(this.router);

    bot.use(async (ctx, next) => {
      const user = await this.prismaService.users.findUnique({
        where: {
          telegramId: String(ctx.from.id),
          role: { in: ['operator', 'packman'] },
        },
      });

      if (!user) {
        ctx['session'].step = 'send-sms';

        return await ctx.reply(messages.first_message, {
          reply_markup: Keyboards.contact,
          parse_mode: 'HTML',
        });
      }

      const orderId = ctx.message.text.split(' ')[1];

      if (orderId)
        return await this.sendLocationToPackman(orderId, ctx.message.chat.id);

      await next();
    });

    bot.use(async (ctx, next) => {
      const publicRoutes = ['idle', 'send-sms', 'confirm-code'];
      if (!publicRoutes.includes(ctx['session'].step)) {
        console.log(ctx['session'].step);
      } else await next();
    });
  }

  private setupErrorHandling() {
    bot.catch((err) => {
      const ctx = err.ctx;
      console.error(`Error while handling update ${ctx.update.update_id}:`);
      const e = err.error;
      if (e instanceof GrammyError) {
        console.error('Error in request:', e.description);
      } else if (e instanceof HttpError) {
        console.error('Could not contact Telegram:', e);
      } else {
        console.error('Unknown error:', e);
      }
    });
  }

  public async launch() {
    await bot.api.setMyCommands([
      {
        command: 'start',
        description: 'Start the bot',
      },
    ]);

    await bot.start();
  }

  async sendOrderToOperators(orderId: string) {
    try {
      const order = await this.prismaService.orders.findUnique({
        where: { id: orderId },
        select: {
          items: {
            select: {
              title_ru: true,
              quantity: true,
            },
          },
          User: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          status: true,
          createdAt: true,
          Address: {
            select: {
              streetName: true,
              deliveryArea: {
                select: {
                  areaRU: true,
                },
              },
            },
          },
        },
      });

      if (order) {
        const operators = await this.prismaService.users.findMany({
          where: {
            role: 'operator',
            verified: true,
            telegramId: {
              not: null,
            },
          },
        });

        for await (const operator of operators) {
          bot.api.sendMessage(operator.telegramId, messages.order_data(order), {
            parse_mode: 'HTML',
            reply_markup: InlineKeyboards.confirm_order_operator(orderId),
          });
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  async sendOrderToPackmans(orderId: string) {
    try {
      const order = await this.prismaService.orders.findUnique({
        where: { id: orderId },
        select: {
          items: {
            select: {
              title_ru: true,
              quantity: true,
            },
          },
          User: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          status: true,
          createdAt: true,
          Address: {
            select: {
              streetName: true,
              deliveryArea: {
                select: {
                  areaRU: true,
                },
              },
              lat: true,
              long: true,
            },
          },
        },
      });

      if (order) {
        const packmans = await this.prismaService.users.findMany({
          where: {
            role: 'packman',
            verified: true,
            telegramId: {
              not: null,
            },
          },
        });

        for await (const packman of packmans) {
          await bot.api.sendLocation(
            packman.telegramId,
            +order.Address.lat,
            +order.Address.long,
          );

          await bot.api.sendMessage(
            packman.telegramId,
            messages.order_data(order),
            {
              parse_mode: 'HTML',
              reply_markup: InlineKeyboards.confirm_order_packman(orderId),
            },
          );
        }
      }
    } catch (err) {
      console.log(err);
    }
  }

  async sendLocationToPackman(orderId: string, chatId: number) {
    try {
      const order = await this.prismaService.orders.findUnique({
        where: { id: orderId },
        select: {
          items: {
            select: {
              title_ru: true,
              quantity: true,
            },
          },
          User: {
            select: {
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
          status: true,
          createdAt: true,
          Address: {
            select: {
              streetName: true,
              deliveryArea: {
                select: {
                  areaRU: true,
                },
              },
              lat: true,
              long: true,
            },
          },
        },
      });

      if (order) {
        await bot.api.sendLocation(
          chatId,
          +order.Address.lat,
          +order.Address.long,
        );
      } else bot.api.sendMessage(chatId, `Bunday buyurtma topilmadi 😔`);
    } catch (err) {
      console.log(err);
    }
  }
}
