import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import prisma from '../src/db/prisma.js';
import { paypalClient } from '../src/integrations/paypal/paypalClient.js';

describe('PayPal API Routes', () => {
  const fakeUserId = '11111111-1111-1111-1111-111111111111';
  const token = jwt.sign({ userId: fakeUserId }, env.JWT_SECRET, { expiresIn: '1h' });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: fakeUserId,
      fullName: 'Test User',
      email: 'test@example.com',
    });
  });

  describe('GET /api/v1/paypal/status', () => {
    it('should return PayPal Sandbox configuration status', async () => {
      const res = await request(app)
        .get('/api/v1/paypal/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBeDefined();
      expect(res.body.data.status.environment).toBe('sandbox');
    });
  });

  describe('POST /api/v1/paypal/orders', () => {
    it('should create an order via PayPal client mock', async () => {
      vi.spyOn(paypalClient, 'request').mockResolvedValue({
        id: 'PAYPAL-ORDER-12345',
        status: 'CREATED',
      });

      vi.spyOn(prisma.paymentOrder, 'create').mockResolvedValue({
        id: 'order-uuid-1',
        userId: fakeUserId,
        paypalOrderId: 'PAYPAL-ORDER-12345',
        amount: '25.00',
        currency: 'USD',
        status: 'CREATED',
      });

      const res = await request(app)
        .post('/api/v1/paypal/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          amount: 25.00,
          currency: 'USD',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.paypalOrderId).toBe('PAYPAL-ORDER-12345');
    });
  });

  describe('POST /api/v1/paypal/webhook', () => {
    it('should accept webhook endpoint publicly', async () => {
      vi.spyOn(prisma.payPalWebhookEvent, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prisma.payPalWebhookEvent, 'create').mockResolvedValue({
        id: 'wh-1',
        providerEventId: 'WH-EVT-123',
        eventType: 'PAYMENT.CAPTURE.COMPLETED',
      });
      vi.spyOn(prisma.payPalWebhookEvent, 'update').mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/paypal/webhook')
        .send({
          id: 'WH-EVT-123',
          event_type: 'PAYMENT.CAPTURE.COMPLETED',
          resource: { id: 'CAPTURE-123' },
        });

      expect(res.status).toBe(200);
      expect(res.body.received).toBe(true);
    });
  });
});

