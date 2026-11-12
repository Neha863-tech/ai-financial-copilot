import { transactionService } from '../services/transaction.service.js';
import { csvImportService } from '../services/csvImport.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const transactionController = {
  create: asyncHandler(async (req, res) => {
    const transaction = await transactionService.create(req.user.id, req.body);
    res.status(201).json(ApiResponse.created('Transaction created successfully', { transaction }));
  }),

  list: asyncHandler(async (req, res) => {
    const result = await transactionService.list(req.user.id, req.query);
    res.status(200).json(ApiResponse.success('Transactions retrieved successfully', result.transactions, result.pagination));
  }),

  getById: asyncHandler(async (req, res) => {
    const transaction = await transactionService.getById(req.user.id, req.params.id);
    res.status(200).json(ApiResponse.success('Transaction retrieved successfully', { transaction }));
  }),

  update: asyncHandler(async (req, res) => {
    const transaction = await transactionService.update(req.user.id, req.params.id, req.body);
    res.status(200).json(ApiResponse.success('Transaction updated successfully', { transaction }));
  }),

  delete: asyncHandler(async (req, res) => {
    const result = await transactionService.softDelete(req.user.id, req.params.id);
    res.status(200).json(ApiResponse.success(result.message));
  }),

  importCsv: asyncHandler(async (req, res) => {
    if (!req.file) {
      throw ApiError.badRequest('Please upload a CSV file');
    }

    const result = await csvImportService.importCsv(req.user.id, req.file.buffer);
    res.status(200).json(ApiResponse.success('CSV import completed', result));
  }),
};

