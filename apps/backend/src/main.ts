import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: (origin, callback) => {
      // allow server-to-server or tools that don't send Origin
      if (!origin) return callback(null, true);

      const onrenderPattern =
        /^https?:\/\/([a-zA-Z0-9-]+\.)*onrender\.com(?::\d+)?$/;
      const localhostPattern = /^http:\/\/localhost(?::\d+)?$/;
      const beautysafePattern =
        /^https:\/\/([a-zA-Z0-9-]+\.)*beautysafe\.online(?::\d+)?$/;

      if (
        onrenderPattern.test(origin) ||
        localhostPattern.test(origin) ||
        beautysafePattern.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
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

  // ✅ Render: bind to 0.0.0.0 and use PORT
  const port = Number(process.env.PORT) || 10000;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 API is listening on http://0.0.0.0:${port}`);
}

bootstrap();
