export interface OllamaRequest {
  model: string;

  prompt: string;

  stream: false;

  images?: string[];
}
