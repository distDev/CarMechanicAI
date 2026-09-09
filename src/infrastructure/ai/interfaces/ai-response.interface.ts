import { AiProviderType } from '../enums/ai-provider.enum';

export interface AiResponse {
  content: string;

  model: string;

  platform: AiProviderType;
}
