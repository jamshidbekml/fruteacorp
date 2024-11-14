import 'colors';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import { MyBot } from './bot/bot';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('PORT');
  const apiPrefix: string = config.get<string>('API_PREFIX');

  app.enableCors({ origin: '*' });
  app.enableShutdownHooks();
  // app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.use(
    [`/${apiPrefix}/docs`],
    basicAuth({
      users: { fruteacorp: 'fruteacorp' },
      challenge: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FRUTEACORP API')
    .setDescription('REST API docs for FRUTEACORP')
    .setVersion('0.0.1')
    .addTag('REST API')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const bot = new MyBot();

  bot.launch();

  await app.listen(port, () => {
    console.log(`Application is running on: ${port}`.bgGreen.bold);
  });
}
bootstrap();
