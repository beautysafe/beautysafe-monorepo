import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const onrenderPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)*onrender\.com(?::\d+)?$/;
      const localhostPattern = /^http:\/\/localhost(?::\d+)?$/;
      const lemsaPattern = /^https:\/\/([a-zA-Z0-9-]+\.)*lemsainnovation\.com(?::\d+)?$/;
      if (onrenderPattern.test(origin) || localhostPattern.test(origin) || lemsaPattern.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Beauty Safe API')
    .setDescription('API docs for Beauty Safe backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
