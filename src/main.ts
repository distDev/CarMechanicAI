import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { PrismaService } from '@/infrastructure/prisma/prisma.service';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(ConfigService);
  const prismaService = app.get(PrismaService);

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(configService.getOrThrow<string>('app.apiPrefix'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('CarAI Backend API')
    .setDescription('Production-ready backend template API docs')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const swaggerCustomOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };

  SwaggerModule.setup(
    configService.getOrThrow<string>('app.swaggerPath'),
    app,
    document,
    swaggerCustomOptions,
  );

  prismaService.enableShutdownHooks(app);

  const port = configService.getOrThrow<number>('app.port');
  await app.listen(port);
}

void bootstrap();
