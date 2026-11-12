import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import prisma from '../src/db/prisma.js';

describe('Analytics API Routes', () => {
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

  describe('GET /api/v1/analytics/summary', () => {
    it('should compute income, expenses, and savings rate', async () => {
      vi.spyOn(prisma.transaction, 'aggregate')
        .mockResolvedValueOnce({ _sum: { amount: '50000.00' }, _count: 2 })
        .mockResolvedValueOnce({ _sum: { amount: '20000.00' }, _count: 10 });

      const res = await request(app)
        .get('/api/v1/analytics/summary?currency=INR')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary.totalIncome).toBe('50000.00');
      expect(res.body.data.summary.totalExpenses).toBe('20000.00');
      expect(res.body.data.summary.netCashFlow).toBe('30000.00');
      expect(res.body.data.summary.savingsRate).toBe(60);
    });
  });
});

