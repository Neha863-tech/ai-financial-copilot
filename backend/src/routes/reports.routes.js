import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/historical', reportsController.getHistorical);
router.get('/current', reportsController.getCurrent);
router.get('/forecast', reportsController.getForecast);
router.get('/export', reportsController.exportCSV);

export default router;
