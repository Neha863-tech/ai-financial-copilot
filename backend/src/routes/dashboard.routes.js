import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { optionalAuthenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { analyticsQuerySchema } from '../validators/analytics.validator.js';

const router = Router();

router.use(optionalAuthenticate);

router.get('/', validate(analyticsQuerySchema), dashboardController.getDashboard);

export default router;

