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
      '09f2c566-3f22-42b0-88be-6ca2987439f1',
    );
  }
}
