import { paypalAuthService } from '../integrations/paypal/paypalAuth.service.js';
import { paypalOrdersService } from '../integrations/paypal/paypalOrders.service.js';
import { paypalReportingService } from '../integrations/paypal/paypalReporting.service.js';
import { paypalWebhookService } from '../integrations/paypal/paypalWebhook.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const paypalController = {
  getStatus: asyncHandler(async (req, res) => {
    const status = await paypalAuthService.getStatus();
    res.status(200).json(ApiResponse.success('PayPal status retrieved', { status }));
  }),

  createOrder: asyncHandler(async (req, res) => {
    const order = await paypalOrdersService.createOrder(req.user.id, req.body);
    res.status(201).json(ApiResponse.created('PayPal order created', order));
  }),

  captureOrder: asyncHandler(async (req, res) => {
    const result = await paypalOrdersService.captureOrder(req.user.id, req.params.orderId);
    res.status(200).json(ApiResponse.success('PayPal order captured successfully', result));
  }),

  syncReporting: asyncHandler(async (req, res) => {
    const result = await paypalReportingService.syncTransactions(req.user.id, req.body);
    res.status(200).json(ApiResponse.success('Reporting synchronization completed', result));
  }),

  handleWebhook: asyncHandler(async (req, res) => {
    const result = await paypalWebhookService.verifyAndProcess(req.headers, req.body);
    res.status(200).json({ received: true, ...result });
  }),
};

