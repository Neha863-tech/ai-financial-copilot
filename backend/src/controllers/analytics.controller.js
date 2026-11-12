import { analyticsService } from '../services/analytics.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const analyticsController = {
  getSummary: asyncHandler(async (req, res) => {
    const summary = await analyticsService.getSummary(req.user.id, req.query);
    res.status(200).json(ApiResponse.success('Financial summary retrieved', { summary }));
  }),

  getCategories: asyncHandler(async (req, res) => {
    const categories = await analyticsService.getCategoryBreakdown(req.user.id, req.query);
    res.status(200).json(ApiResponse.success('Category breakdown retrieved', { categories }));
  }),

  getTrends: asyncHandler(async (req, res) => {
    const trends = await analyticsService.getTrends(req.user.id, req.query);
    res.status(200).json(ApiResponse.success('Spending trends retrieved', { trends }));
  }),

  getComparison: asyncHandler(async (req, res) => {
    const comparison = await analyticsService.getComparison(req.user.id, req.query);
    res.status(200).json(ApiResponse.success('Period comparison retrieved', { comparison }));
  }),
};

