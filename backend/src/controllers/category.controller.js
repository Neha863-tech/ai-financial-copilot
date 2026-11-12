import { categoryService } from '../services/category.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const categoryController = {
  list: asyncHandler(async (req, res) => {
    const categories = await categoryService.list(req.user.id);
    res.status(200).json(ApiResponse.success('Categories retrieved successfully', { categories }));
  }),

  create: asyncHandler(async (req, res) => {
    const category = await categoryService.create(req.user.id, req.body);
    res.status(201).json(ApiResponse.created('Category created successfully', { category }));
  }),

  update: asyncHandler(async (req, res) => {
    const category = await categoryService.update(req.user.id, req.params.id, req.body);
    res.status(200).json(ApiResponse.success('Category updated successfully', { category }));
  }),

  delete: asyncHandler(async (req, res) => {
    const result = await categoryService.delete(req.user.id, req.params.id);
    res.status(200).json(ApiResponse.success(result.message));
  }),
};

