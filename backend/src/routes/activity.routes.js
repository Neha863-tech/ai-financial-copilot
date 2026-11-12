import { Router } from 'express';
import { activityController } from '../controllers/activity.controller.js';
import { optionalAuthenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(optionalAuthenticate);

router.get('/', activityController.getActivities);
router.get('/export', activityController.exportActivities);
router.get('/audit-logs', activityController.getAuditLogs);

export default router;
