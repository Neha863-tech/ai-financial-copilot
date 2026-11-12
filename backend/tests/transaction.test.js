import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import prisma from '../src/db/prisma.js';

describe('Transaction API Routes', () => {
  const fakeUserId = '11111111-1111-1111-1111-111111111111';
  const token = jwt.sign({ userId: fakeUserId }, env.JWT_SECRET, { expiresIn: '1h' });

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({
      id: fakeUserId,
      fullName: 'Test User',
      email: 'test@example.com',
      preferredCurrency: 'INR',
      timezone: 'Asia/Kolkata',
    });
  });

  describe('GET /api/v1/transactions', () => {
    it('should list user transactions with pagination', async () => {
      vi.spyOn(prisma.transaction, 'findMany').mockResolvedValue([]);
      vi.spyOn(prisma.transaction, 'count').mockResolvedValue(0);

      const res = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe('POST /api/v1/transactions', () => {
    it('should validate invalid amounts', async () => {
      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          merchant: 'Swiggy',
          amount: -50,
          direction: 'EXPENSE',
          transactionDate: new Date().toISOString(),
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should create valid transaction with rule categorization', async () => {
      vi.spyOn(prisma.category, 'findFirst').mockResolvedValue({
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Food & Dining',
      });

      vi.spyOn(prisma.transaction, 'create').mockResolvedValue({
        id: '33333333-3333-3333-3333-333333333333',
        userId: fakeUserId,
        merchant: 'Swiggy',
        amount: '450.00',
        currency: 'INR',
        direction: 'EXPENSE',
        status: 'COMPLETED',
        transactionDate: new Date(),
        categorizationMethod: 'RULE',
        category: { id: '22222222-2222-2222-2222-222222222222', name: 'Food & Dining' },
      });

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          merchant: 'Swiggy',
          description: 'Lunch order',
          amount: 450.00,
          currency: 'INR',
          direction: 'EXPENSE',
          transactionDate: new Date().toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transaction.merchant).toBe('Swiggy');
    });
  });
});

