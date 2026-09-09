import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AiService } from './services/ai.service';
import { ProviderChainService } from './providers/provider-chain.service';
import { OllamaProvider } from './providers/ollama/ollama.provider';
import { AiProvidersFactory } from './providers/ai-providers.factory';

import { AI_PROVIDERS } from './constants/ai.constants';

@Module({
  imports: [
    ConfigModule,
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        timeout: configService.getOrThrow<number>('ai.timeoutMs'),
      }),
    }),
  ],
  providers: [
    AiService,
    ProviderChainService,
    OllamaProvider,
    AiProvidersFactory,
    {
      provide: AI_PROVIDERS,
      useFactory: (factory: AiProvidersFactory) => factory.create(),
      inject: [AiProvidersFactory],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
