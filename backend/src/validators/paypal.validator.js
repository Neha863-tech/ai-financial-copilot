import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    amount: z.string().or(z.number()).refine(val => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be positive'),
    currency: z.string().length(3).toUpperCase().optional().default('USD'),
    description: z.string().max(255).optional().default('AI Financial Copilot - Demo Payment'),
  }),
});

export const captureOrderSchema = z.object({
  params: z.object({
    orderId: z.string().min(1),
  }),
});

export const reportingSyncSchema = z.object({
  body: z.object({
    startDate: z.string().datetime({ offset: true }).optional(),
    endDate: z.string().datetime({ offset: true }).optional(),
  }).optional().default({}),
});
