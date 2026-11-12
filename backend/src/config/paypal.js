import { env } from './env.js';

export const paypalConfig = {
  clientId: env.PAYPAL_CLIENT_ID,
  clientSecret: env.PAYPAL_CLIENT_SECRET,
  environment: env.PAYPAL_ENV,
  webhookId: env.PAYPAL_WEBHOOK_ID,
  currency: env.PAYPAL_CURRENCY,
  get baseUrl() {
    return this.environment === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';
  },
};
