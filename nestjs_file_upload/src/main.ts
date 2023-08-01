import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('nestjs_upload')
    .setDescription('The NestJS API Description')
    .setVersion('1.0')
    .addTag('AWS S3 & Multer')
    .build();
  const docs = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, docs);

  await app.listen(3000);
}
bootstrap();
