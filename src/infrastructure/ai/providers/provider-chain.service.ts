import {
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

import { AiProvider } from '../interfaces/ai-provider.interface';
import { AiRequest } from '../interfaces/ai-request.interface';
import { AiResponse } from '../interfaces/ai-response.interface';

import { AI_PROVIDERS } from '../constants/ai.constants';

@Injectable()
export class ProviderChainService {
  private readonly logger = new Logger(ProviderChainService.name);

  constructor(
    @Inject(AI_PROVIDERS)
    private readonly providers: AiProvider[],
  ) {}

  async generate(request: AiRequest): Promise<AiResponse> {
    if (this.providers.length === 0) {
      throw new ServiceUnavailableException('No AI providers configured');
    }

    let lastError: unknown;

    for (const provider of this.providers) {
      try {
        return await provider.generate(request);
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `AI provider "${provider.type}" failed, trying next provider`,
          error instanceof Error ? error.stack : String(error),
        );
      }
    }

    throw new ServiceUnavailableException('All AI providers failed', {
      cause: lastError,
    });
  }
}
