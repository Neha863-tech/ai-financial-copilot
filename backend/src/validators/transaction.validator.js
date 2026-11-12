import { z } from 'zod';

export const createTransactionSchema = z.object({
  body: z.object({
    merchant: z.string().max(255).optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
    amount: z.string().or(z.number()).refine(val => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be a positive number'),
    currency: z.string().length(3).toUpperCase().default('INR'),
    direction: z.enum(['INCOME', 'EXPENSE']),
    transactionDate: z.string().datetime({ offset: true }).or(z.string().date()),
    categoryId: z.string().uuid().optional().nullable(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional().default('COMPLETED'),
  }),
});

export const updateTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    merchant: z.string().max(255).optional().nullable(),
    description: z.string().max(1000).optional().nullable(),
    amount: z.string().or(z.number()).refine(val => {
      const num = Number(val);
      return !isNaN(num) && num > 0;
    }, 'Amount must be a positive number').optional(),
    currency: z.string().length(3).toUpperCase().optional(),
    direction: z.enum(['INCOME', 'EXPENSE']).optional(),
    transactionDate: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
    categoryId: z.string().uuid().optional().nullable(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
  }),
});

export const getTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const listTransactionsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    direction: z.enum(['INCOME', 'EXPENSE']).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']).optional(),
    source: z.enum(['MANUAL', 'CSV', 'PAYPAL_REPORTING', 'PAYPAL_CHECKOUT', 'DEMO']).optional(),
    search: z.string().max(200).optional(),
    sortBy: z.enum(['transactionDate', 'amount', 'createdAt', 'merchant']).optional().default('transactionDate'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }).optional().default({}),
});
