import { AiProviderType } from '../enums/ai-provider.enum';
import { AiRequest } from './ai-request.interface';
import { AiResponse } from './ai-response.interface';

export interface AiProvider {
  readonly type: AiProviderType;

  generate(request: AiRequest): Promise<AiResponse>;
}
