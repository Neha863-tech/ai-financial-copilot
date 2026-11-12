import { paypalClient } from './paypalClient.js';
import { paypalConfig } from '../../config/paypal.js';

export const paypalAuthService = {
  async getStatus() {
    try {
      if (!paypalConfig.clientId || paypalConfig.clientId === 'replace_with_sandbox_client_id') {
        return {
          configured: false,
          environment: paypalConfig.environment,
          clientId: null,
          currency: paypalConfig.currency,
          message: 'PayPal Sandbox credentials not configured in environment',
        };
      }

      await paypalClient.getAccessToken();
      return {
        configured: true,
        environment: paypalConfig.environment,
        clientId: paypalConfig.clientId,
        currency: paypalConfig.currency,
      };
    } catch (error) {
      return {
        configured: false,
        environment: paypalConfig.environment,
        clientId: paypalConfig.clientId !== 'replace_with_sandbox_client_id' ? paypalConfig.clientId : null,
        currency: paypalConfig.currency,
        error: error.message || 'PayPal credentials are not configured or invalid',
      };
    }
  },
};

