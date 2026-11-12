import { Router } from 'express';
import { recurringController } from '../controllers/recurring.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

const updateRecurringSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    expectedAmount: z.string().or(z.number()).optional(),
    frequency: z.enum(['WEEKLY', 'MONTHLY', 'YEARLY', 'UNKNOWN']).optional(),
    nextDueAt: z.string().datetime({ offset: true }).or(z.string().date()).optional(),
    status: z.enum(['DETECTED', 'CONFIRMED', 'DISMISSED', 'CANCELLED']).optional(),
  }),
});

router.use(authenticate);

router.get('/', recurringController.list);
router.post('/detect', recurringController.detect);
router.post('/:id/confirm', recurringController.confirm);
router.post('/:id/dismiss', recurringController.dismiss);
router.patch('/:id', validate(updateRecurringSchema), recurringController.update);

export default router;

