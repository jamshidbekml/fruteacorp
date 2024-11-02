import parseUrl from 'url-parse';
import { Injectable } from '@nestjs/common';
import { Bot, GrammyError, HttpError, session } from 'grammy';
import { Router } from '@grammyjs/router';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/api/prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class BotService {
  private bot: Bot;
  private router;
  private readonly lockFile = '/tmp/bot.lock';

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
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware() {
    this.bot.use(session({ initial: () => ({ step: 'idle' }) }));
    this.bot.use(this.router);
  }

  private setupRoutes() {
    this.router.route('start', async (ctx) => {
      await ctx.reply('Welcome to the bot!');
      ctx.session.step = 'next_step';
    });

    this.router.route('next_step', async (ctx) => {
      await ctx.reply('You are now in the next step.');
      ctx.session.step = 'end';
    });

    this.bot.command('help', async (ctx) => {
      await ctx.reply('Here is some help text.');
    });

    this.bot.on('message', async (ctx) => {
      await ctx.reply('Received a message!');
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
    if (fs.existsSync(this.lockFile)) {
      console.log('Boshqa bot instansiyasi allaqachon ishlayapti.');
      process.exit(1); // Dasturdan chiqish
    } else {
      // Fayl yaratish orqali boshqa instansiyalarni bloklaymiz
      fs.writeFileSync(this.lockFile, 'running');
      console.log('Bot ishga tushdi');
    }
  }
}
