import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import prisma from '../src/db/prisma.js';
import { toolRegistry } from '../src/integrations/ai/tools/toolRegistry.js';

describe('AI API Routes', () => {
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

  it('should require authentication for private AI conversations', async () => {
    const res = await request(app).get('/api/v1/ai/conversations');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  describe('Tool Registry', () => {
    it('should have all 8 allowlisted tools registered', () => {
      const toolNames = toolRegistry.getAllTools().map(t => t.name);
      expect(toolNames).toContain('get_financial_summary');
      expect(toolNames).toContain('get_expenses_by_category');
      expect(toolNames).toContain('compare_periods');
      expect(toolNames).toContain('get_budget_status');
      expect(toolNames).toContain('get_recurring_payments');
      expect(toolNames).toContain('get_upcoming_reminders');
      expect(toolNames).toContain('simulate_savings');
      expect(toolNames).toContain('get_recent_transactions');
    });

    it('should disallow unknown tools', () => {
      expect(toolRegistry.isAllowed('execute_arbitrary_sql')).toBe(false);
      expect(toolRegistry.isAllowed('transfer_money')).toBe(false);
    });
  });

  describe('GET /api/v1/ai/conversations', () => {
    it('should list user conversations', async () => {
      vi.spyOn(prisma.aIConversation, 'findMany').mockResolvedValue([]);

      const res = await request(app)
        .get('/api/v1/ai/conversations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.conversations)).toBe(true);
    });
  });
});

