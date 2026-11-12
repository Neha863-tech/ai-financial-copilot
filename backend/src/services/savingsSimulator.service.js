import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const savingsSimulatorService = {
  async simulate(userId, { categoryId, reductionPercentage, months = 12, startDate, endDate }) {
    if (reductionPercentage < 0 || reductionPercentage > 100) {
      throw ApiError.badRequest('Reduction percentage must be between 0 and 100');
    }

    // Calculate baseline spending
    const where = {
      userId,
      direction: 'EXPENSE',
      status: 'COMPLETED',
      deletedAt: null,
    };

    if (categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          OR: [{ userId }, { userId: null, isSystem: true }],
        },
      });
      if (!category) {
        throw ApiError.badRequest('Invalid category');
      }
      where.categoryId = categoryId;
    }

    if (startDate) {
      where.transactionDate = { ...(where.transactionDate || {}), gte: new Date(startDate) };
    }
    if (endDate) {
      where.transactionDate = { ...(where.transactionDate || {}), lt: new Date(endDate) };
    }

    const result = await prisma.transaction.aggregate({
      where,
      _sum: { amount: true },
      _count: true,
    });

    // Calculate period length in months
    let periodMonths = 1;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      periodMonths = Math.max(1, Math.round((end - start) / (30.44 * 24 * 60 * 60 * 1000)));
    }

    const totalSpending = Number(result._sum.amount || 0);
    const baselineMonthlySpend = totalSpending / periodMonths;
    const estimatedMonthlySavings = baselineMonthlySpend * (reductionPercentage / 100);
    const estimatedTotalSavings = estimatedMonthlySavings * months;

    // Get category name if applicable
    let categoryName = 'All Categories';
    if (categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true },
      });
      categoryName = cat?.name || 'Unknown';
    }

    return {
      categoryId,
      categoryName,
      reductionPercentage,
      months,
      baselineMonthlySpend: baselineMonthlySpend.toFixed(2),
      estimatedMonthlySavings: estimatedMonthlySavings.toFixed(2),
      estimatedTotalSavings: estimatedTotalSavings.toFixed(2),
      period: { startDate, endDate },
      disclaimer: 'These are estimates based on historical spending patterns, not guaranteed savings.',
    };
  },
};
