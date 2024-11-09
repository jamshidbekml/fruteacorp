import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ApiModule } from './api/api.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BotService } from './bot/bot.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads', 'permanent'),
      serveRoot: '/images',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads', 'temp'),
      serveRoot: '/temp/images',
    }),
    ApiModule,
  ],
  providers: [BotService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly botService: BotService) {}

  async onModuleInit() {
    // await this.botService.launch();
  }
}
