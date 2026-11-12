import { insightService } from '../services/insight.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const insightController = {
  getInsights: asyncHandler(async (req, res) => {
    const currency = req.query.currency || req.user.preferredCurrency || 'INR';
    const insights = await insightService.generateInsights(req.user.id, currency);
    res.status(200).json(ApiResponse.success('Insights retrieved successfully', { insights }));
  }),
};

