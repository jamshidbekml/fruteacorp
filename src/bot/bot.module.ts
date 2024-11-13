import { Global, Module, OnModuleInit } from '@nestjs/common';
import { MyBot } from './bot';
import BotService from './sevices/bot.service';

@Global()
@Module({
  providers: [MyBot, BotService],
  exports: [MyBot],
})
export class BotModule implements OnModuleInit {
  constructor(private readonly botService: MyBot) {}

  async onModuleInit() {
    // await this.botService.launch();
  }
}
