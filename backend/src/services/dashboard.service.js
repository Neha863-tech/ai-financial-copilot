import { analyticsService } from './analytics.service.js';
import { budgetService } from './budget.service.js';
import { reminderService } from './reminder.service.js';
import { insightService } from './insight.service.js';
import prisma from '../db/prisma.js';
import { getCurrentMonthRange } from '../utils/dateRange.js';

export const dashboardService = {
  async getDashboard(userId, { startDate, endDate, currency }) {
    const monthRange = getCurrentMonthRange();
    const effectiveStart = startDate || monthRange.startDate.toISOString();
    const effectiveEnd = endDate || monthRange.endDate.toISOString();

    const [summary, categories, recentTransactions, budgets, upcomingReminders, insights] = await Promise.all([
      analyticsService.getSummary(userId, { startDate: effectiveStart, endDate: effectiveEnd, currency }),
      analyticsService.getCategoryBreakdown(userId, { startDate: effectiveStart, endDate: effectiveEnd, currency }),
      prisma.transaction.findMany({
        where: { userId, deletedAt: null },
        include: { category: true },
        orderBy: { transactionDate: 'desc' },
        take: 5,
      }),
      budgetService.list(userId),
      reminderService.getUpcoming(userId, 7),
      insightService.generateInsights(userId, currency).catch(() => []),
    ]);

    return {
      summary,
      categoryBreakdown: categories,
      recentTransactions,
      budgets: budgets.slice(0, 5),
      upcomingReminders,
      insights,
    };
  },
};

