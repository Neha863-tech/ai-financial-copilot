import { Router } from 'express';
import { simulatorController } from '../controllers/simulator.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { z } from 'zod';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

const simulateSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid().optional().nullable(),
    reductionPercentage: z.coerce.number().min(0).max(100),
    months: z.coerce.number().int().positive().optional().default(12),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

router.use(authenticate);

router.post('/savings', validate(simulateSchema), simulatorController.simulate);

export default router;

