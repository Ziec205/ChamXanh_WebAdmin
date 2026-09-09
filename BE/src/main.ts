import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  const logger = new Logger('KhoiDong');

  app.use(helmet());
  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: config.get<string[]>('corsOrigins'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Swagger chỉ bật ngoài môi trường production.
  if (config.get<string>('env') !== 'production') {
    const tailieu = new DocumentBuilder()
      .setTitle('API Chạm Xanh')
      .setDescription('Nguồn sự thật duy nhất cho Mobile, Web Admin và Web giới thiệu.')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, tailieu));
  }

  const port = config.get<number>('port')!;
  await app.listen(port);

  logger.log(`API chạy tại http://localhost:${port}/api/v1`);
  if (config.get<string>('env') !== 'production') {
    logger.log(`Tài liệu Swagger tại http://localhost:${port}/api/docs`);
  }
}

bootstrap();
