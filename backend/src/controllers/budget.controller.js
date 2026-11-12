import { budgetService } from '../services/budget.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const budgetController = {
  create: asyncHandler(async (req, res) => {
    const budget = await budgetService.create(req.user.id, req.body);
    res.status(201).json(ApiResponse.created('Budget created successfully', { budget }));
  }),

  list: asyncHandler(async (req, res) => {
    const budgets = await budgetService.list(req.user.id);
    res.status(200).json(ApiResponse.success('Budgets retrieved successfully', { budgets }));
  }),

  update: asyncHandler(async (req, res) => {
    const budget = await budgetService.update(req.user.id, req.params.id, req.body);
    res.status(200).json(ApiResponse.success('Budget updated successfully', { budget }));
  }),

  delete: asyncHandler(async (req, res) => {
    const result = await budgetService.delete(req.user.id, req.params.id);
    res.status(200).json(ApiResponse.success(result.message));
  }),
};

