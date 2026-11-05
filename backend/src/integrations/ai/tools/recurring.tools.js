import { recurringService } from '../../../services/recurring.service.js';
import { reminderService } from '../../../services/reminder.service.js';

export const recurringTools = [
  {
    name: 'get_recurring_payments',
    description: 'Get list of detected and confirmed recurring payments such as subscriptions and regular bills.',
    parameters: {
      type: 'OBJECT',
      properties: {
        status: { type: 'STRING', description: 'Filter by status: DETECTED, CONFIRMED, DISMISSED, CANCELLED' },
      },
    },
    async execute({ userId, status }) {
      const payments = await recurringService.list(userId, { status });
      return payments.map(p => ({
        merchant: p.merchant,
        expectedAmount: Number(p.expectedAmount).toFixed(2),
        currency: p.currency,
        frequency: p.frequency,
        nextDueAt: p.nextDueAt?.toISOString().split('T')[0] || null,
        confidence: p.confidence,
        status: p.status,
      }));
    },
  },
  {
    name: 'get_upcoming_reminders',
    description: 'Get upcoming bill reminders and due dates within a specified number of days.',
    parameters: {
      type: 'OBJECT',
      properties: {
        days: { type: 'NUMBER', description: 'Number of days ahead to look (default 7)' },
      },
    },
    async execute({ userId, days = 7 }) {
      const reminders = await reminderService.getUpcoming(userId, days);
      return reminders.map(r => ({
        title: r.title,
        amount: r.amount ? Number(r.amount).toFixed(2) : null,
        currency: r.currency,
        dueAt: r.dueAt.toISOString().split('T')[0],
        status: r.status,
      }));
    },
  },
];

