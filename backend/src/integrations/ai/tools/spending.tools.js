import { analyticsService } from '../../../services/analytics.service.js';
import prisma from '../../../db/prisma.js';

export const spendingTools = [
  {
    name: 'get_financial_summary',
    description: 'Get financial summary including total income, total expenses, net cash flow, and savings rate for a specific date range and currency.',
    parameters: {
      type: 'OBJECT',
      properties: {
        startDate: { type: 'STRING', description: 'Start date in ISO format (e.g. 2026-11-01)' },
        endDate: { type: 'STRING', description: 'End date in ISO format (e.g. 2026-11-30)' },
        currency: { type: 'STRING', description: 'Currency code (e.g. INR, USD)' },
      },
    },
    async execute({ userId, startDate, endDate, currency }) {
      return analyticsService.getSummary(userId, { startDate, endDate, currency });
    },
  },
  {
    name: 'get_expenses_by_category',
    description: 'Get expense breakdown by category for a specific date range, showing totals and percentages.',
    parameters: {
      type: 'OBJECT',
      properties: {
        startDate: { type: 'STRING', description: 'Start date' },
        endDate: { type: 'STRING', description: 'End date' },
        currency: { type: 'STRING', description: 'Currency code' },
      },
    },
    async execute({ userId, startDate, endDate, currency }) {
      return analyticsService.getCategoryBreakdown(userId, { startDate, endDate, currency });
    },
  },
  {
    name: 'compare_periods',
    description: 'Compare financial data between two time periods, showing differences and percentage changes in income and expenses.',
    parameters: {
      type: 'OBJECT',
      properties: {
        currentStart: { type: 'STRING', description: 'Current period start date' },
        currentEnd: { type: 'STRING', description: 'Current period end date' },
        previousStart: { type: 'STRING', description: 'Previous period start date' },
        previousEnd: { type: 'STRING', description: 'Previous period end date' },
        currency: { type: 'STRING', description: 'Currency code' },
      },
      required: ['currentStart', 'currentEnd', 'previousStart', 'previousEnd'],
    },
    async execute({ userId, currentStart, currentEnd, previousStart, previousEnd, currency }) {
      return analyticsService.getComparison(userId, { currentStart, currentEnd, previousStart, previousEnd, currency });
    },
  },
  {
    name: 'get_recent_transactions',
    description: 'Get recent transactions for the user, optionally filtered by date range, category, or direction.',
    parameters: {
      type: 'OBJECT',
      properties: {
        startDate: { type: 'STRING', description: 'Start date' },
        endDate: { type: 'STRING', description: 'End date' },
        limit: { type: 'NUMBER', description: 'Number of transactions to return (max 20)' },
        direction: { type: 'STRING', description: 'Filter by direction: INCOME or EXPENSE' },
        categoryName: { type: 'STRING', description: 'Filter by category name' },
      },
    },
    async execute({ userId, startDate, endDate, limit = 10, direction, categoryName }) {
      const where = { userId, deletedAt: null };
      if (startDate) where.transactionDate = { ...where.transactionDate, gte: new Date(startDate) };
      if (endDate) where.transactionDate = { ...where.transactionDate, lt: new Date(endDate) };
      if (direction) where.direction = direction;
      if (categoryName) {
        const category = await prisma.category.findFirst({
          where: { name: categoryName, OR: [{ userId }, { userId: null, isSystem: true }] },
        });
        if (category) where.categoryId = category.id;
      }

      const transactions = await prisma.transaction.findMany({
        where,
        include: { category: { select: { name: true } } },
        orderBy: { transactionDate: 'desc' },
        take: Math.min(limit, 20),
      });

      return transactions.map(t => ({
        merchant: t.merchant,
        description: t.description,
        amount: Number(t.amount).toFixed(2),
        currency: t.currency,
        direction: t.direction,
        category: t.category?.name || 'Uncategorized',
        date: t.transactionDate.toISOString().split('T')[0],
        status: t.status,
      }));
    },
  },
];

