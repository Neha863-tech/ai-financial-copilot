import { aiConfig } from '../../config/ai.js';
import { GeminiProvider } from './providers/gemini.provider.js';
import { GroqProvider } from './providers/groq.provider.js';

const providers = {
  gemini: GeminiProvider,
  groq: GroqProvider,
};

export function createAIProvider() {
  const providerKey = (aiConfig.provider || '').toLowerCase();
  const ProviderClass = providers[providerKey] || (process.env.GROQ_API_KEY ? GroqProvider : GeminiProvider);
  return new ProviderClass();
}
