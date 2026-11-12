import { analyticsService } from './analytics.service.js';
import { getCurrentMonthRange, getPreviousMonthRange } from '../utils/dateRange.js';

export const insightService = {
  async generateInsights(userId, currency) {
    const currentMonth = getCurrentMonthRange();
    const previousMonth = getPreviousMonthRange();

    const [currentSummary, previousSummary, categoryBreakdown] = await Promise.all([
      analyticsService.getSummary(userId, {
        startDate: currentMonth.startDate.toISOString(),
        endDate: currentMonth.endDate.toISOString(),
        currency,
      }),
      analyticsService.getSummary(userId, {
        startDate: previousMonth.startDate.toISOString(),
        endDate: previousMonth.endDate.toISOString(),
        currency,
      }),
      analyticsService.getCategoryBreakdown(userId, {
        startDate: currentMonth.startDate.toISOString(),
        endDate: currentMonth.endDate.toISOString(),
        currency,
      }),
    ]);

    const insights = [];
    const currentExpenses = Number(currentSummary.totalExpenses);
    const previousExpenses = Number(previousSummary.totalExpenses);
    const curr = currency || currentSummary.currency || 'INR';

    if (previousExpenses > 0) {
      const changePercent = (((currentExpenses - previousExpenses) / previousExpenses) * 100).toFixed(1);
      if (currentExpenses > previousExpenses) {
        insights.push({
          type: 'SPENDING_INCREASE',
          title: 'Spending Increased',
          description: `Your expenses increased by ${changePercent}% compared to last month (${curr} ${previousExpenses.toFixed(2)} → ${curr} ${currentExpenses.toFixed(2)}).`,
          severity: Number(changePercent) > 20 ? 'HIGH' : 'MEDIUM',
        });
      } else if (currentExpenses < previousExpenses) {
        insights.push({
          type: 'SPENDING_DECREASE',
          title: 'Spending Decreased',
          description: `Your expenses decreased by ${Math.abs(Number(changePercent))}% compared to last month. Great job keeping expenses lower!`,
          severity: 'LOW',
        });
      }
    }

    if (categoryBreakdown.length > 0) {
      const top = categoryBreakdown[0];
      insights.push({
        type: 'TOP_CATEGORY',
        title: `Top Spending Category: ${top.categoryName}`,
        description: `${top.categoryName} is your largest expense category at ${top.currency || curr} ${top.total} (${top.percentage}% of total expenses).`,
        severity: 'INFO',
      });
    }

    const savingsRate = currentSummary.savingsRate;
    if (savingsRate !== null) {
      if (savingsRate < 10) {
        insights.push({
          type: 'LOW_SAVINGS',
          title: 'Low Savings Rate Alert',
          description: `Your savings rate is ${savingsRate}% this month. Consider reviewing non-essential spending.`,
          severity: 'HIGH',
        });
      } else if (savingsRate >= 30) {
        insights.push({
          type: 'GOOD_SAVINGS',
          title: 'Healthy Savings Rate',
          description: `Your savings rate is ${savingsRate}% this month. You are on track with personal savings!`,
          severity: 'LOW',
        });
      }
    }

    return insights;
  },
};

