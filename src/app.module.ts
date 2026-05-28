import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { redisStore } from 'cache-manager-redis-yet';
import appConfig from '@config/app.config';
import databaseConfig from '@config/database.config';
import { envValidationSchema } from '@config/env.validation';
import redisConfig from '@config/redis.config';
import { PrismaModule } from '@/infrastructure/prisma/prisma.module';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'development'}`, '.env'],
      validationSchema: envValidationSchema,
      load: [appConfig, databaseConfig, redisConfig],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp: {
          level: configService.getOrThrow<string>('app.logLevel'),
          transport:
            process.env.NODE_ENV !== 'production'
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
        },
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          socket: {
            host: configService.getOrThrow<string>('redis.host'),
            port: configService.getOrThrow<number>('redis.port'),
          },
        }),
        ttl: configService.getOrThrow<number>('redis.ttlSeconds'),
      }),
    }),
    PrismaModule,

    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
