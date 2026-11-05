import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  analyticsQuerySchema,
  comparisonQuerySchema,
} from '../validators/analytics.validator.js';

const router = Router();

router.use(authenticate);

router.get('/summary', validate(analyticsQuerySchema), analyticsController.getSummary);
router.get('/categories', validate(analyticsQuerySchema), analyticsController.getCategories);
router.get('/trends', validate(analyticsQuerySchema), analyticsController.getTrends);
router.get('/comparison', validate(comparisonQuerySchema), analyticsController.getComparison);

export default router;

