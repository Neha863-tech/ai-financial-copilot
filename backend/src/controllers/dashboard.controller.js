import { dashboardService } from '../services/dashboard.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboardController = {
  getDashboard: asyncHandler(async (req, res) => {
    const data = await dashboardService.getDashboard(req.user.id, {
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      currency: req.query.currency || req.user.preferredCurrency || 'INR',
    });
    res.status(200).json(ApiResponse.success('Dashboard data retrieved', data));
  }),
};

