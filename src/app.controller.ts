import { Controller, Get } from '@nestjs/common';
import { MyBot } from './bot/bot';
import { Public } from './api/auth/decorators/public.decorator';

@Controller('app')
export class AppController {
  constructor(
    // private readonly prismaService: PrismaService,
    private readonly botService: MyBot,
  ) {}
  @Get()
  @Public()
  async getHello() {
    console.log('hello');
    this.botService.sendOrderToOperators(
      '2a1ed21c-9cd7-471e-8d06-ae5c61191e72',
    );
  }
}
