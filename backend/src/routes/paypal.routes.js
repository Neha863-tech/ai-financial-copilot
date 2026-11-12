import { Router } from 'express';
import { paypalController } from '../controllers/paypal.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createOrderSchema,
  captureOrderSchema,
  reportingSyncSchema,
} from '../validators/paypal.validator.js';

const router = Router();

// Public webhook endpoint - NO JWT auth (verified via PayPal signature)
router.post('/webhook', paypalController.handleWebhook);

// Protected routes
router.get('/status', authenticate, paypalController.getStatus);
router.post('/orders', authenticate, validate(createOrderSchema), paypalController.createOrder);
router.post('/orders/:orderId/capture', authenticate, validate(captureOrderSchema), paypalController.captureOrder);
router.post('/reporting/sync', authenticate, validate(reportingSyncSchema), paypalController.syncReporting);

export default router;

