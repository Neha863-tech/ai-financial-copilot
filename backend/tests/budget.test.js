import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import prisma from '../src/db/prisma.js';

describe('Budget API Routes', () => {
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

  describe('GET /api/v1/budgets', () => {
    it('should return budgets with calculated utilization', async () => {
      vi.spyOn(prisma.budget, 'findMany').mockResolvedValue([
        {
          id: 'b1',
          userId: fakeUserId,
          scopeKey: 'overall',
          amount: '10000.00',
          currency: 'INR',
          periodStart: new Date('2026-11-01'),
          periodEnd: new Date('2026-11-30'),
          category: null,
        },
      ]);

      vi.spyOn(prisma.transaction, 'aggregate').mockResolvedValue({
        _sum: { amount: '4500.00' },
      });

      const res = await request(app)
        .get('/api/v1/budgets')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.budgets).toHaveLength(1);
      expect(res.body.data.budgets[0].spent).toBe('4500.00');
      expect(res.body.data.budgets[0].status).toBe('ON_TRACK');
    });
  });
});

