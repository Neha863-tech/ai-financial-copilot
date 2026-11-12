import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import prisma from '../db/prisma.js';

const router = Router();
router.use(authenticate);

router.get('/events', asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const [recurring, reminders, goals] = await Promise.all([
    prisma.recurringPayment.findMany({
      where: { userId, status: { in: ['DETECTED', 'CONFIRMED'] } },
    }),
    prisma.reminder.findMany({
      where: { userId },
      orderBy: { dueAt: 'asc' },
    }),
    prisma.savingsGoal.findMany({
      where: { userId },
    }),
  ]);

  const now = new Date();
  const events = [];

  // 1. Reminders
  for (const r of reminders) {
    const dueDate = new Date(r.dueAt);
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    let status = 'PLANNED';
    if (r.status === 'COMPLETED') status = 'COMPLETED';
    else if (r.status === 'DISMISSED') status = 'CANCELLED';
    else if (diffDays < 0) status = 'OVERDUE';
    else if (diffDays <= 3) status = 'DUE_SOON';

    events.push({
      id: r.id,
      title: r.title,
      amount: Number(r.amount || 0),
      currency: r.currency || 'INR',
      date: r.dueAt,
      category: 'Bill / Utility',
      type: 'BILL',
      status,
      isRecurring: !!r.recurringPaymentId,
    });
  }

  // 2. Recurring payments (project next 30 days)
  for (const rec of recurring) {
    const nextDue = rec.nextDueAt ? new Date(rec.nextDueAt) : new Date(now.getFullYear(), now.getMonth() + 1, 5);
    const diffDays = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
    let status = 'PLANNED';
    if (diffDays < 0) status = 'OVERDUE';
    else if (diffDays <= 3) status = 'DUE_SOON';

    events.push({
      id: 'rec-' + rec.id,
      title: `${rec.merchant} (${rec.frequency})`,
      amount: Number(rec.expectedAmount),
      currency: rec.currency || 'INR',
      date: nextDue,
      category: 'Subscription / Recurring',
      type: 'RECURRING',
      status,
      frequency: rec.frequency,
    });
  }

  // 3. Savings Goal Milestones
  for (const g of goals) {
    events.push({
      id: 'goal-' + g.id,
      title: `🎯 Goal Target: ${g.title}`,
      amount: Number(g.targetAmount),
      currency: g.currency || 'INR',
      date: g.targetDate,
      category: 'Savings Milestone',
      type: 'MILESTONE',
      status: g.status === 'COMPLETED' ? 'COMPLETED' : 'PLANNED',
    });
  }

  res.status(200).json(ApiResponse.success('Calendar events retrieved', { events }));
}));

export default router;
