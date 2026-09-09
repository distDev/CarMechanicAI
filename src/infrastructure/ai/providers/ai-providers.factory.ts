import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AiProviderType } from '../enums/ai-provider.enum';
import { AiProvider } from '../interfaces/ai-provider.interface';
import { OllamaProvider } from './ollama/ollama.provider';

@Injectable()
export class AiProvidersFactory {
  private readonly logger = new Logger(AiProvidersFactory.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly ollamaProvider: OllamaProvider,
  ) {}

  create(): AiProvider[] {
    const configured = this.configService.getOrThrow<string[]>('ai.providers');

    const registry = new Map<string, AiProvider>([
      [AiProviderType.OLLAMA, this.ollamaProvider],
    ]);

    const providers: AiProvider[] = [];

    for (const name of configured) {
      const provider = registry.get(name);

      if (provider) {
        providers.push(provider);
        continue;
      }

      this.logger.warn(
        `AI provider "${name}" is configured in AI_PROVIDER but not implemented yet, skipping`,
      );
    }

    if (providers.length === 0) {
      throw new Error(
        `No supported AI providers available. AI_PROVIDER=${configured.join(', ')}`,
      );
    }

    return providers;
  }
}
