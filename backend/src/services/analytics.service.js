import prisma from '../db/prisma.js';
import { getCurrentMonthRange, getPreviousMonthRange } from '../utils/dateRange.js';

export const analyticsService = {
  async getSummary(userId, { startDate, endDate, currency }) {
    const dateFilter = buildDateFilter(startDate, endDate);
    const currencyFilter = currency ? { currency } : {};

    const [incomeResult, expenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          direction: 'INCOME',
          status: 'COMPLETED',
          deletedAt: null,
          ...dateFilter,
          ...currencyFilter,
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          direction: 'EXPENSE',
          status: 'COMPLETED',
          deletedAt: null,
          ...dateFilter,
          ...currencyFilter,
        },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = Number(incomeResult._sum.amount || 0);
    const totalExpenses = Number(expenseResult._sum.amount || 0);
    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netCashFlow / totalIncome) * 100 : null;

    return {
      totalIncome: totalIncome.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      netCashFlow: netCashFlow.toFixed(2),
      savingsRate: savingsRate !== null ? Number(savingsRate.toFixed(2)) : null,
      incomeCount: incomeResult._count,
      expenseCount: expenseResult._count,
      currency: currency || 'ALL',
      period: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    };
  },

  async getCategoryBreakdown(userId, { startDate, endDate, currency }) {
    const dateFilter = buildDateFilter(startDate, endDate);
    const currencyFilter = currency ? { currency } : {};

    const categories = await prisma.transaction.groupBy({
      by: ['categoryId', 'currency'],
      where: {
        userId,
        direction: 'EXPENSE',
        status: 'COMPLETED',
        deletedAt: null,
        ...dateFilter,
        ...currencyFilter,
      },
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: 'desc' } },
    });

    // Fetch category names
    const categoryIds = categories.map(c => c.categoryId).filter(Boolean);
    const categoryMap = {};
    
    if (categoryIds.length > 0) {
      const cats = await prisma.category.findMany({
        where: { id: { in: categoryIds } },
        select: { id: true, name: true },
      });
      cats.forEach(c => { categoryMap[c.id] = c.name; });
    }

    const totalExpenses = categories.reduce((sum, c) => sum + Number(c._sum.amount || 0), 0);

    return categories.map(c => ({
      categoryId: c.categoryId,
      categoryName: categoryMap[c.categoryId] || 'Uncategorized',
      currency: c.currency,
      total: Number(c._sum.amount || 0).toFixed(2),
      count: c._count,
      percentage: totalExpenses > 0 
        ? Number(((Number(c._sum.amount || 0) / totalExpenses) * 100).toFixed(2))
        : 0,
    }));
  },

  async getTrends(userId, { startDate, endDate, currency }) {
    const dateFilter = buildDateFilter(startDate, endDate);
    const currencyFilter = currency ? { currency } : {};

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        status: 'COMPLETED',
        deletedAt: null,
        ...dateFilter,
        ...currencyFilter,
      },
      select: {
        amount: true,
        direction: true,
        transactionDate: true,
        currency: true,
      },
      orderBy: { transactionDate: 'asc' },
    });

    // Group by month
    const monthlyData = {};
    for (const txn of transactions) {
      const date = new Date(txn.transactionDate);
      const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[key]) {
        monthlyData[key] = { month: key, income: 0, expenses: 0, currency: txn.currency };
      }
      
      const amount = Number(txn.amount);
      if (txn.direction === 'INCOME') {
        monthlyData[key].income += amount;
      } else {
        monthlyData[key].expenses += amount;
      }
    }

    return Object.values(monthlyData).map(m => ({
      ...m,
      income: m.income.toFixed(2),
      expenses: m.expenses.toFixed(2),
      netCashFlow: (m.income - m.expenses).toFixed(2),
    }));
  },

  async getComparison(userId, { currentStart, currentEnd, previousStart, previousEnd, currency }) {
    const currencyFilter = currency ? { currency } : {};

    const [currentSummary, previousSummary] = await Promise.all([
      this.getSummary(userId, { startDate: currentStart, endDate: currentEnd, currency }),
      this.getSummary(userId, { startDate: previousStart, endDate: previousEnd, currency }),
    ]);

    const incomeChange = calculatePercentageChange(
      Number(previousSummary.totalIncome),
      Number(currentSummary.totalIncome)
    );
    const expenseChange = calculatePercentageChange(
      Number(previousSummary.totalExpenses),
      Number(currentSummary.totalExpenses)
    );

    return {
      current: currentSummary,
      previous: previousSummary,
      changes: {
        income: incomeChange,
        expenses: expenseChange,
      },
    };
  },
};

function buildDateFilter(startDate, endDate) {
  const filter = {};
  if (startDate || endDate) {
    filter.transactionDate = {};
    if (startDate) filter.transactionDate.gte = new Date(startDate);
    if (endDate) filter.transactionDate.lt = new Date(endDate);
  }
  return filter;
}

function calculatePercentageChange(previous, current) {
  if (previous === 0) {
    if (current > 0) return { value: null, label: 'NEW_SPENDING' };
    return { value: 0, label: 'NO_CHANGE' };
  }
  const change = ((current - previous) / previous) * 100;
  return { value: Number(change.toFixed(2)), label: change > 0 ? 'INCREASED' : change < 0 ? 'DECREASED' : 'NO_CHANGE' };
}
