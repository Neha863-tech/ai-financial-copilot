import { z } from 'zod';

export const analyticsQuerySchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    currency: z.string().length(3).toUpperCase().optional(),
  }).optional().default({}),
});

export const comparisonQuerySchema = z.object({
  query: z.object({
    currentStart: z.string(),
    currentEnd: z.string(),
    previousStart: z.string(),
    previousEnd: z.string(),
    currency: z.string().length(3).toUpperCase().optional(),
  }),
});
