import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [/\.lvh\.me$/], // Allow all lvh.me subdomains (for local development)
    credentials: true,
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'some-secret', // In production, use environment variables
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
      },
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
