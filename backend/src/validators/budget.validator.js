import { z } from 'zod';

export const createBudgetSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid().optional().nullable(),
    amount: z.string().or(z.number()).refine(val => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, 'Budget amount must be positive'),
    currency: z.string().length(3).toUpperCase().default('INR'),
    periodStart: z.string().date('Invalid period start date'),
    periodEnd: z.string().date('Invalid period end date'),
    note: z.string().max(500).optional().nullable(),
  }),
});

export const updateBudgetSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    amount: z.string().or(z.number()).refine(val => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, 'Budget amount must be positive').optional(),
    note: z.string().max(500).optional().nullable(),
  }),
});

export const deleteBudgetSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
