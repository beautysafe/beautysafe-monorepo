import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
    app.enableCors({
      origin: [
    'http://localhost:5173',
    'https://beauty-safe-monorepo-1.onrender.com'
  ],
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
