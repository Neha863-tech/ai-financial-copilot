import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { categorizationService } from './categorization.service.js';
import { Decimal } from '@prisma/client/runtime/library';

export const transactionService = {
  async create(userId, data) {
    // Auto-categorize if no category provided
    let categoryId = data.categoryId || null;
    let categorizationMethod = 'NONE';
    let categoryConfidence = null;

    if (!categoryId && (data.merchant || data.description)) {
      const catResult = await categorizationService.categorize({
        merchant: data.merchant,
        description: data.description,
        direction: data.direction,
        userId,
      });
      if (catResult.categoryId) {
        categoryId = catResult.categoryId;
        categorizationMethod = catResult.method;
        categoryConfidence = catResult.confidence;
      }
    } else if (categoryId) {
      categorizationMethod = 'USER';
      // Verify category belongs to user or is system
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [{ userId }, { userId: null, isSystem: true }],
        },
      });
      if (!category) {
        throw ApiError.badRequest('Invalid category');
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        categoryId,
        source: 'MANUAL',
        merchant: data.merchant || null,
        description: data.description || null,
        amount: new Decimal(data.amount),
        currency: data.currency || 'INR',
        direction: data.direction,
        status: data.status || 'COMPLETED',
        transactionDate: new Date(data.transactionDate),
        categorizationMethod,
        categoryConfidence: categoryConfidence ? new Decimal(categoryConfidence) : null,
      },
      include: { category: true },
    });

    return transaction;
  },

  async list(userId, filters = {}) {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      categoryId,
      direction,
      status,
      source,
      search,
      sortBy = 'transactionDate',
      sortOrder = 'desc',
    } = filters;

    const where = {
      userId,
      deletedAt: null,
    };

    if (startDate) {
      where.transactionDate = { ...(where.transactionDate || {}), gte: new Date(startDate) };
    }
    if (endDate) {
      where.transactionDate = { ...(where.transactionDate || {}), lt: new Date(endDate) };
    }
    if (categoryId) where.categoryId = categoryId;
    if (direction) where.direction = direction;
    if (status) where.status = status;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { merchant: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (page - 1) * limit;
    const allowedSortFields = ['transactionDate', 'amount', 'createdAt', 'merchant'];
    const orderField = allowedSortFields.includes(sortBy) ? sortBy : 'transactionDate';

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { [orderField]: sortOrder === 'asc' ? 'asc' : 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getById(userId, id) {
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
      include: { category: true },
    });

    if (!transaction) {
      throw ApiError.notFound('Transaction not found');
    }

    return transaction;
  },

  async update(userId, id, data) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw ApiError.notFound('Transaction not found');
    }

    // Only allow editing manual transactions or category updates
    const updateData = {};
    if (data.merchant !== undefined) updateData.merchant = data.merchant;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = new Decimal(data.amount);
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.direction !== undefined) updateData.direction = data.direction;
    if (data.transactionDate !== undefined) updateData.transactionDate = new Date(data.transactionDate);
    if (data.status !== undefined) updateData.status = data.status;
    
    if (data.categoryId !== undefined) {
      if (data.categoryId) {
        const category = await prisma.category.findFirst({
          where: {
            id: data.categoryId,
            OR: [{ userId }, { userId: null, isSystem: true }],
          },
        });
        if (!category) {
          throw ApiError.badRequest('Invalid category');
        }
      }
      updateData.categoryId = data.categoryId;
      updateData.categorizationMethod = 'USER';
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });

    return transaction;
  },

  async softDelete(userId, id) {
    const existing = await prisma.transaction.findFirst({
      where: { id, userId, deletedAt: null },
    });

    if (!existing) {
      throw ApiError.notFound('Transaction not found');
    }

    await prisma.transaction.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Transaction deleted successfully' };
  },
};
