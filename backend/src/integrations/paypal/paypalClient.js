import { paypalConfig } from '../../config/paypal.js';
import { logger } from '../../utils/logger.js';

let cachedToken = null;
let tokenExpiry = null;

export const paypalClient = {
  async getAccessToken() {
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    if (!paypalConfig.clientId || paypalConfig.clientId === 'replace_with_sandbox_client_id') {
      throw new Error('PayPal client credentials are not configured');
    }

    const auth = Buffer.from(`${paypalConfig.clientId}:${paypalConfig.clientSecret}`).toString('base64');

    const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      logger.error('PayPal token request failed', { status: response.status });
      throw new Error(`PayPal authentication failed: ${response.status}`);
    }

    const data = await response.json();
    cachedToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in - 300) * 1000;

    return cachedToken;
  },

  async request(method, path, body = null) {
    const token = await this.getAccessToken();
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${paypalConfig.baseUrl}${path}`, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      logger.error('PayPal API request failed', {
        method,
        path,
        status: response.status,
      });
      throw new Error(`PayPal API error: ${response.status} - ${data?.message || 'Unknown error'}`);
    }

    return data;
  },

  invalidateToken() {
    cachedToken = null;
    tokenExpiry = null;
  },
};

