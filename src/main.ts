import 'colors';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as basicAuth from 'express-basic-auth';
import * as session from 'express-session';
import * as pg from 'pg';
import * as connectPgSimple from 'connect-pg-simple';
import bot from './api/bot';

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule);
  const config: ConfigService = app.get(ConfigService);
  const port: number = config.get<number>('PORT');
  const apiPrefix: string = config.get<string>('API_PREFIX');

  const pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const PgSession = connectPgSimple(session);

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://fruteacorp.uz',
    ],
    credentials: true,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  app.use(
    [`/${apiPrefix}/docs`],
    basicAuth({
      users: { fruteacorp: 'fruteacorp' },
      challenge: true,
    }),
  );

  app.use(
    session({
      name: 'sessionId',
      store: new PgSession({
        pool: pgPool,
        tableName: 'session', // Session ma'lumotlar uchun jadval nomi
      }),
      secret: config.get<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365,
        // httpOnly: true,
        // secure: process.env.NODE_ENV === 'production',
        secure: false,
        sameSite: 'none',
      },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('FRUTEACORP API')
    .setDescription('REST API docs for FRUTEACORP')
    .setVersion('0.0.1')
    .addTag('REST API')
    .addBearerAuth()
    .addCookieAuth('sessionId')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  bot.launch().catch((err) => {
    console.log(err.message);
  });

  await app.listen(port, () => {
    console.log(`Application is running on: ${port}`.bgGreen.bold);
  });
}
bootstrap();
