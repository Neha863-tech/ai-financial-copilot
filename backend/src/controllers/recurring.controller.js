import { recurringService } from '../services/recurring.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const recurringController = {
  list: asyncHandler(async (req, res) => {
    const recurringPayments = await recurringService.list(req.user.id, req.query);
    res.status(200).json(ApiResponse.success('Recurring payments retrieved', { recurringPayments }));
  }),

  confirm: asyncHandler(async (req, res) => {
    const recurringPayment = await recurringService.confirm(req.user.id, req.params.id);
    res.status(200).json(ApiResponse.success('Recurring payment confirmed', { recurringPayment }));
  }),

  dismiss: asyncHandler(async (req, res) => {
    const recurringPayment = await recurringService.dismiss(req.user.id, req.params.id);
    res.status(200).json(ApiResponse.success('Recurring payment dismissed', { recurringPayment }));
  }),

  update: asyncHandler(async (req, res) => {
    const recurringPayment = await recurringService.update(req.user.id, req.params.id, req.body);
    res.status(200).json(ApiResponse.success('Recurring payment updated', { recurringPayment }));
  }),

  detect: asyncHandler(async (req, res) => {
    const detected = await recurringService.detectRecurring(req.user.id);
    res.status(200).json(ApiResponse.success('Recurring detection completed', { detected }));
  }),
};

