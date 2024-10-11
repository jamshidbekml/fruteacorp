import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

const config = new ConfigService();
const bot = new Telegraf(config.get<string>('TELEGRAM_BOT_TOKEN'));

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.on(message('sticker'), (ctx) => ctx.reply('👍'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
