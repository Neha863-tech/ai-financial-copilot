import { env } from './env.js';

export const aiConfig = {
  provider: env.AI_PROVIDER.toLowerCase(),
  apiKey: env.AI_API_KEY,
  model: env.AI_MODEL || (env.AI_PROVIDER.toLowerCase() === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-2.0-flash'),
  temperature: env.AI_TEMPERATURE,
  maxToolRounds: env.AI_MAX_TOOL_ROUNDS,
};
