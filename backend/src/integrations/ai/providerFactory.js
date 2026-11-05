import { aiConfig } from '../../config/ai.js';
import { GeminiProvider } from './providers/gemini.provider.js';

const providers = {
  gemini: GeminiProvider,
};

export function createAIProvider() {
  const ProviderClass = providers[aiConfig.provider] || GeminiProvider;
  return new ProviderClass();
}

