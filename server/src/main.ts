import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for subdomains
  app.enableCors({
    origin: [/\.lvh\.me$/], // Allow all lvh.me subdomains
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
        // Don't set domain to allow cookies to be domain-specific
        // This ensures each subdomain gets its own cookies
      },
    }),
  );

  // Set the global prefix for API endpoints
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
