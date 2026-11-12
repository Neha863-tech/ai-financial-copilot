import { paypalClient } from './paypalClient.js';
import { paypalConfig } from '../../config/paypal.js';
import prisma from '../../db/prisma.js';
import { logger } from '../../utils/logger.js';

export const paypalWebhookService = {
  async verifyAndProcess(headers, body) {
    let isVerified = false;
    try {
      isVerified = await this.verifySignature(headers, body);
    } catch (err) {
      logger.warn('Webhook signature check encountered an error:', { error: err.message });
    }

    if (!isVerified) {
      logger.warn('PayPal webhook signature verification failed');
      return { status: 'REJECTED', reason: 'Invalid signature' };
    }

    const event = body;
    const providerEventId = event.id;
    const eventType = event.event_type;

    const existing = await prisma.payPalWebhookEvent.findUnique({
      where: { providerEventId },
    });

    if (existing) {
      logger.info('Duplicate PayPal webhook event ignored', { providerEventId });
      return { status: 'DUPLICATE' };
    }

    const webhookEvent = await prisma.payPalWebhookEvent.create({
      data: {
        providerEventId,
        eventType,
        resourceId: event.resource?.id || null,
        payload: event,
        processingStatus: 'VERIFIED',
      },
    });

    try {
      await this.processEvent(event);

      await prisma.payPalWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processingStatus: 'PROCESSED', processedAt: new Date() },
      });

      return { status: 'PROCESSED' };
    } catch (error) {
      logger.error('PayPal webhook processing failed', {
        eventId: providerEventId,
        error: error.message,
      });

      await prisma.payPalWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { processingStatus: 'FAILED' },
      });

      return { status: 'FAILED', reason: error.message };
    }
  },

  async verifySignature(headers, body) {
    if (!paypalConfig.webhookId || paypalConfig.webhookId === 'replace_with_sandbox_webhook_id') {
      logger.warn('PayPal webhook ID not configured, signature verification skipped in sandbox/dev');
      return true;
    }

    try {
      const verificationPayload = {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: paypalConfig.webhookId,
        webhook_event: body,
      };

      const result = await paypalClient.request(
        'POST',
        '/v1/notifications/verify-webhook-signature',
        verificationPayload
      );

      return result.verification_status === 'SUCCESS';
    } catch (error) {
      logger.error('Webhook signature verification error', { error: error.message });
      return false;
    }
  },

  async processEvent(event) {
    const resourceId = event.resource?.id;
    if (!resourceId) return;

    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        await this.handleCaptureCompleted(event.resource);
        break;
      }
      case 'PAYMENT.CAPTURE.PENDING': {
        await this.handleCapturePending(event.resource);
        break;
      }
      case 'PAYMENT.CAPTURE.DENIED': {
        await this.handleCaptureDenied(event.resource);
        break;
      }
      case 'PAYMENT.CAPTURE.REFUNDED': {
        await this.handleCaptureRefunded(event.resource);
        break;
      }
      default:
        logger.info('Unhandled PayPal webhook event type', { eventType: event.event_type });
    }
  },

  async handleCaptureCompleted(resource) {
    const captureId = resource.id;
    
    const transaction = await prisma.transaction.findFirst({
      where: { source: 'PAYPAL_CHECKOUT', externalId: captureId },
    });

    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'COMPLETED' },
      });
    }

    const supplementaryId = resource.supplementary_data?.related_ids?.order_id;
    if (supplementaryId) {
      const order = await prisma.paymentOrder.findUnique({
        where: { paypalOrderId: supplementaryId },
      });
      if (order) {
        await prisma.paymentOrder.update({
          where: { id: order.id },
          data: { status: 'COMPLETED' },
        });
      }
    }
  },

  async handleCapturePending(resource) {
    const captureId = resource.id;
    const transaction = await prisma.transaction.findFirst({
      where: { source: 'PAYPAL_CHECKOUT', externalId: captureId },
    });

    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'PENDING' },
      });
    }
  },

  async handleCaptureDenied(resource) {
    const captureId = resource.id;
    const transaction = await prisma.transaction.findFirst({
      where: { source: 'PAYPAL_CHECKOUT', externalId: captureId },
    });

    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      });
    }
  },

  async handleCaptureRefunded(resource) {
    const captureId = resource.id;
    const transaction = await prisma.transaction.findFirst({
      where: { source: 'PAYPAL_CHECKOUT', externalId: captureId },
    });

    if (transaction) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'REFUNDED' },
      });
    }
  },
};

