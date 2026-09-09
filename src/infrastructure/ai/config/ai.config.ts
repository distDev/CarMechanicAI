import { registerAs } from '@nestjs/config';

export default registerAs('ai', () => ({
  providers: (process.env.AI_PROVIDER ?? '')
    .split(',')
    .map((provider) => provider.trim())
    .filter(Boolean),

  timeoutMs: Number(process.env.AI_REQUEST_TIMEOUT_MS ?? 120_000),

  ollama: {
    url: process.env.OLLAMA_URL,
    model: process.env.OLLAMA_MODEL,
  },

  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.OPENROUTER_MODEL,
  },
}));
