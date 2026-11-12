import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').transform(v => v.trim().toLowerCase()),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address').transform(v => v.trim().toLowerCase()),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(2).max(100).optional(),
    preferredCurrency: z.string().length(3).toUpperCase().optional(),
    timezone: z.string().min(1).optional(),
  }),
});
