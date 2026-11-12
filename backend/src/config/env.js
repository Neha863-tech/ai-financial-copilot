import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  APP_NAME: z.string().default('AI Financial Copilot'),
  FRONTEND_URL: z.string().default('http://localhost:5173'),
  API_BASE_URL: z.string().default('http://localhost:5000'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string().min(10),
  JWT_EXPIRES_IN: z.string().default('1d'),
  COOKIE_NAME: z.string().default('afc_session'),
  AI_PROVIDER: z.string().default('gemini'),
  AI_API_KEY: z.string().default('replace_me'),
  AI_MODEL: z.string().optional(),
  AI_TEMPERATURE: z.coerce.number().default(0.2),
  AI_MAX_TOOL_ROUNDS: z.coerce.number().default(4),
  PAYPAL_ENV: z.enum(['sandbox', 'live']).default('sandbox'),
  PAYPAL_CLIENT_ID: z.string().default('replace_with_sandbox_client_id'),
  PAYPAL_CLIENT_SECRET: z.string().default('replace_with_sandbox_client_secret'),
  PAYPAL_WEBHOOK_ID: z.string().default('replace_with_sandbox_webhook_id'),
  PAYPAL_CURRENCY: z.string().default('USD'),
  MAX_CSV_FILE_SIZE_MB: z.coerce.number().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
