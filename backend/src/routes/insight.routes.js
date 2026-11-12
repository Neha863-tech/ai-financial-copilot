import { Router } from 'express';
import { insightController } from '../controllers/insight.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', insightController.getInsights);

export default router;

