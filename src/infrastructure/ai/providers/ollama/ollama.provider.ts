import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { AiProvider } from '../../interfaces/ai-provider.interface';
import { AiProviderType } from '../../enums/ai-provider.enum';
import { AiRequest } from '../../interfaces/ai-request.interface';
import { AiResponse } from '../../interfaces/ai-response.interface';
import { OllamaRequest } from './interfaces/ollama-request.interface';
import { OllamaResponse } from './interfaces/ollama-response.interface';

@Injectable()
export class OllamaProvider implements AiProvider {
  readonly type = AiProviderType.OLLAMA;

  private readonly logger = new Logger(OllamaProvider.name);

  private readonly generateUrl: string;

  private readonly model: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.generateUrl = `${this.configService.getOrThrow<string>('ai.ollama.url')}/api/generate`;
    this.model = this.configService.getOrThrow<string>('ai.ollama.model');
  }

  async generate(request: AiRequest): Promise<AiResponse> {
    const payload = this.createRequest(request);

    const response = await this.sendRequest(payload);

    return this.parseResponse(response);
  }

  private createRequest(request: AiRequest): OllamaRequest {
    return {
      model: this.model,
      prompt: request.prompt,
      stream: false,
      ...(request.images?.length && {
        images: request.images.map((image) => image.toString('base64')),
      }),
    };
  }

  private async sendRequest(payload: OllamaRequest): Promise<OllamaResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<OllamaResponse>(this.generateUrl, payload),
      );

      return response.data;
    } catch (error) {
      this.logger.error(
        'Ollama request failed',
        error instanceof AxiosError
          ? `${error.message}: ${JSON.stringify(error.response?.data)}`
          : error,
      );

      throw new InternalServerErrorException('Ollama provider request failed');
    }
  }

  private parseResponse(response: OllamaResponse): AiResponse {
    return {
      platform: AiProviderType.OLLAMA,
      model: response.model,
      content: response.response,
    };
  }
}
