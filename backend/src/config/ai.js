import { env } from './env.js';

export const aiConfig = {
  provider: env.AI_PROVIDER,
  apiKey: env.AI_API_KEY,
  model: env.AI_MODEL,
  temperature: env.AI_TEMPERATURE,
  maxToolRounds: env.AI_MAX_TOOL_ROUNDS,
};
