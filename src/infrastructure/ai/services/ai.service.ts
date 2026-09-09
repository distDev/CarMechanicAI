import { Injectable } from '@nestjs/common';

import { AiRequest } from '../interfaces/ai-request.interface';
import { AiResponse } from '../interfaces/ai-response.interface';

import { ProviderChainService } from '../providers/provider-chain.service';

@Injectable()
export class AiService {
  constructor(private readonly providerChain: ProviderChainService) {}

  async generate(request: AiRequest): Promise<AiResponse> {
    return this.providerChain.generate(request);
  }
}
