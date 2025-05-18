import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for subdomains
  app.enableCors({
    origin: [/\.lvh\.me$/, 'http://localhost:5173'], // Allow all subdomains and frontend dev server
    credentials: true, // Required for cookies/session
  });

  // Configure session
  app.use(
    session({
      secret: 'your-secret-key', // In production, use environment variables
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
        domain:
          process.env.NODE_ENV === 'production' ? '.myapp.lvh.me' : undefined,
      },
    }),
  );

  // Set the global prefix for API endpoints
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
