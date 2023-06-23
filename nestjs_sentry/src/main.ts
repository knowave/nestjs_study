import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as Sentry from '@sentry/node';
import { SentryIntercepter } from './common/sentry.intercepter';
import { WebhookIntercepter } from './common/webhook.intercepter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
  });
  app.useGlobalInterceptors(new SentryIntercepter());
  app.useGlobalInterceptors(new WebhookIntercepter());
  await app.listen(3000);
}
bootstrap();
