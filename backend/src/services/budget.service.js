import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { Decimal } from '@prisma/client/runtime/library';
import { BUDGET_WARNING_THRESHOLD } from '../utils/constants.js';
import { activityLogger } from './activityLogger.service.js';

export const budgetService = {
  async create(userId, data) {
    const scopeKey = data.categoryId ? `category:${data.categoryId}` : 'overall';

    // Verify category ownership if specified
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

    // Check for duplicate budget
    const existing = await prisma.budget.findUnique({
      where: {
        userId_scopeKey_periodStart_currency: {
          userId,
          scopeKey,
          periodStart: new Date(data.periodStart),
          currency: data.currency,
        },
      },
    });

    if (existing) {
      throw ApiError.conflict('A budget already exists for this scope and period');
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        categoryId: data.categoryId || null,
        scopeKey,
        amount: new Decimal(data.amount),
        currency: data.currency,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
        note: data.note || null,
      },
      include: { category: true },
    });

    activityLogger.logActivity({
      userId,
      category: 'FINANCIAL',
      eventType: 'BUDGET_CREATED',
      title: `Budget Created: ${budget.currency} ${budget.amount}`,
      description: `Created budget for ${budget.category?.name || 'Overall Spending'}.`,
      status: 'SUCCESS',
      entityType: 'Budget',
      entityId: budget.id,
    }).catch(() => {});

    return budget;
  },

  async list(userId) {
    const budgets = await prisma.budget.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { periodStart: 'desc' },
    });

    // Calculate spending for each budget
    const budgetsWithUsage = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await this.calculateSpent(userId, budget);
        const limit = Number(budget.amount);
        const spentAmount = Number(spent);
        const utilization = limit > 0 ? (spentAmount / limit) * 100 : 0;

        let status = 'ON_TRACK';
        if (utilization >= 100) status = 'EXCEEDED';
        else if (utilization >= BUDGET_WARNING_THRESHOLD) status = 'WARNING';

        return {
          ...budget,
          spent: spentAmount.toFixed(2),
          remaining: (limit - spentAmount).toFixed(2),
          utilization: Number(utilization.toFixed(2)),
          status,
        };
      })
    );

    return budgetsWithUsage;
  },

  async update(userId, id, data) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw ApiError.notFound('Budget not found');
    }

    const updateData = {};
    if (data.amount !== undefined) updateData.amount = new Decimal(data.amount);
    if (data.note !== undefined) updateData.note = data.note;

    return prisma.budget.update({
      where: { id },
      data: updateData,
      include: { category: true },
    });
  },

  async delete(userId, id) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw ApiError.notFound('Budget not found');
    }

    await prisma.budget.delete({ where: { id } });
    return { message: 'Budget deleted successfully' };
  },

  async calculateSpent(userId, budget) {
    const where = {
      userId,
      direction: 'EXPENSE',
      status: 'COMPLETED',
      deletedAt: null,
      currency: budget.currency,
      transactionDate: {
        gte: budget.periodStart,
        lt: budget.periodEnd,
      },
    };

    if (budget.categoryId) {
      where.categoryId = budget.categoryId;
    }

    const result = await prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
    });

    return Number(result._sum.amount || 0);
  },

  async getBudgetStatus(userId, { period, categoryId, currency }) {
    const where = { userId };
    if (period) {
      where.periodStart = { lte: new Date(period) };
      where.periodEnd = { gte: new Date(period) };
    }
    if (categoryId) where.categoryId = categoryId;
    if (currency) where.currency = currency;

    const budgets = await prisma.budget.findMany({
      where,
      include: { category: true },
    });

    return Promise.all(budgets.map(async (budget) => {
      const spent = await this.calculateSpent(userId, budget);
      const limit = Number(budget.amount);
      const spentAmount = Number(spent);
      const utilization = limit > 0 ? (spentAmount / limit) * 100 : 0;

      let status = 'ON_TRACK';
      if (utilization >= 100) status = 'EXCEEDED';
      else if (utilization >= BUDGET_WARNING_THRESHOLD) status = 'WARNING';

      return {
        budgetId: budget.id,
        categoryName: budget.category?.name || 'Overall',
        limit: limit.toFixed(2),
        spent: spentAmount.toFixed(2),
        remaining: (limit - spentAmount).toFixed(2),
        utilization: Number(utilization.toFixed(2)),
        status,
        currency: budget.currency,
      };
    }));
  },
};
