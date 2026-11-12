import { z } from 'zod';

export const chatSchema = z.object({
  body: z.object({
    conversationId: z.string().uuid().optional().nullable(),
    message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
  }),
});

export const conversationIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});
