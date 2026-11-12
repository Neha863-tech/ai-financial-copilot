import { z } from 'zod';

export const createReminderSchema = z.object({
  body: z.object({
    recurringPaymentId: z.string().uuid().optional().nullable(),
    title: z.string().min(1, 'Title is required').max(255),
    amount: z.string().or(z.number()).refine(val => {
      if (val === null || val === undefined) return true;
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be positive').optional().nullable(),
    currency: z.string().length(3).toUpperCase().optional().nullable(),
    dueAt: z.string().datetime({ offset: true }),
    status: z.enum(['PENDING', 'COMPLETED', 'DISMISSED']).optional().default('PENDING'),
  }),
});

export const updateReminderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    amount: z.string().or(z.number()).optional().nullable(),
    currency: z.string().length(3).toUpperCase().optional().nullable(),
    dueAt: z.string().datetime({ offset: true }).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'DISMISSED']).optional(),
  }),
});

export const deleteReminderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
