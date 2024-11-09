import parseUrl from 'url-parse';
import { Injectable } from '@nestjs/common';
import { Bot, GrammyError, HttpError, session, Keyboard } from 'grammy';
import { Router } from '@grammyjs/router';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/api/prisma/prisma.service';
import { generateRandomNumber } from 'src/api/shared/utils/code-generator';
import { smsSender } from 'src/api/shared/utils/sms-sender';

@Injectable()
export class BotService {
  private bot: Bot;
  private router;

  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');

    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is missing from configuration');
    }

    this.bot = new Bot(token);
    this.router = new Router((ctx) => ctx['session'].step);

    this.setupMiddleware();
    this.setupCommands();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupCommands() {
    this.bot.command('start', async (ctx) => {
      await ctx.reply(
        `<b>Xush kelibsiz!</b>\nBot imkoniyatlaridan foydalanish uchun raqamingizni tasdiqlang.`,
        {
          reply_markup: new Keyboard()
            .requestContact('Share Contact')
            .resized(),
          parse_mode: 'HTML',
        },
      );
      ctx['session'].step = 'send-sms';
    });
  }

  private setupRoutes() {
    this.router.route('send-sms', async (ctx) => {
      console.log(ctx.message.contact);
      const phone = ctx.message.contact.phone_number;
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
        data: { telegramId: ctx.from.id },
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
        where: { telegramId: ctx.from.id },
      });
    });

    this.bot.on('message:contact', async (ctx) => {
      ctx['session'].contact = ctx.message.contact;
      await ctx.reply('Received a message!', {
        reply_markup: { remove_keyboard: true },
      });
    });
  }

  private setupMiddleware() {
    this.bot.use(
      session({
        initial: () => ({
          chat_id: null,
          role: null,
          step: 'idle',
          contact: null,
        }),
      }),
    );

    this.bot.use(this.router);

    this.bot.use(async (ctx, next) => {
      if (
        ctx['session'].step === 'idle' &&
        ctx.message &&
        ctx.message.text !== '/start'
      ) {
        try {
          await ctx.deleteMessage();
        } catch (err) {
          console.error("Xabarni o'chirishda xato:", err);
        }
      } else {
        await next();
      }
    });

    this.bot.use(async (ctx, next) => {
      const publicRoutes = ['idle', 'send-sms', 'confirm-code'];
      if (!publicRoutes.includes(ctx['session'].step)) {
        console.log(ctx['session'].step);
      } else await next();
    });
  }

  private setupErrorHandling() {
    this.bot.catch((err) => {
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
    // await this.bot.api.setMyCommands([
    //   {
    //     command: 'start',
    //     description: 'Start the bot',
    //   },
    // ]);

    this.bot.start();
  }
}
