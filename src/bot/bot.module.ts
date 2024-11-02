import { Global, Module, OnModuleInit } from '@nestjs/common';
import { BotService } from './bot.service';

@Global()
@Module({
  providers: [BotService],
  exports: [BotService],
})
export class BotModule implements OnModuleInit {
  constructor(private readonly bot: BotService) {}

  async onModuleInit() {
    await this.bot.launch();
  }
}
