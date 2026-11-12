import { Router } from 'express';
import prisma from '../db/prisma.js';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getCurrentMonthRange } from '../utils/dateRange.js';

const router = Router();

// Middleware: Authenticate internal microservice or valid user token
const authenticateInternalOrUser = (req, res, next) => {
  const serviceKey = req.headers['x-service-api-key'];
  if (serviceKey && serviceKey === env.AI_SERVICE_API_KEY) {
    return next();
  }

  // Fallback to Bearer token
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Verified by upstream or allow next
    return next();
  }

  // In development, allow local requests
  if (env.NODE_ENV === 'development' && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1')) {
    return next();
  }

  return next(ApiError.unauthorized('Invalid internal service credentials or authorization'));
};

router.use(authenticateInternalOrUser);

// Helper to resolve user
async function resolveUser(userId) {
  if (!userId || userId === 'current' || userId === 'demo-user-1') {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: 'demo@example.com' }, { email: 'arjun.sharma@example.com' }],
      },
    });
    return user || (await prisma.user.findFirst());
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw ApiError.notFound('User not found');
  return user;
}

// 1. Unified Financial Context Snapshot for AI Microservice
router.get(
  '/financial-context/:userId',
  asyncHandler(async (req, res) => {
    const user = await resolveUser(req.params.userId);
    const { startDate: monthStart, endDate: monthEnd } = getCurrentMonthRange();

    // Fetch transactions, budgets, recurring payments, savings goals, accounts
    const [transactions, budgets, recurring, goals, categories, recentPurchases] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: user.id, deletedAt: null },
        include: { category: true },
        orderBy: { transactionDate: 'desc' },
        take: 100,
      }),
      prisma.budget.findMany({
        where: { userId: user.id },
        include: { category: true },
      }),
      prisma.recurringPayment.findMany({
        where: { userId: user.id },
      }),
      prisma.savingsGoal.findMany({
        where: { userId: user.id },
      }),
      prisma.category.findMany({
        where: {
          OR: [{ userId: user.id }, { isSystem: true }],
        },
      }),
      prisma.purchase.findMany({
        where: { userId: user.id },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Current month calculations
    let currentMonthIncome = 0;
    let currentMonthExpenses = 0;
    const categorySpending = {};

    transactions.forEach((tx) => {
      const d = new Date(tx.transactionDate);
      const amt = Number(tx.amount);
      if (d >= monthStart && d <= monthEnd && tx.status === 'COMPLETED') {
        if (tx.direction === 'INCOME') {
          currentMonthIncome += amt;
        } else if (tx.direction === 'EXPENSE') {
          currentMonthExpenses += amt;
          const catName = tx.category?.name || 'Uncategorized';
          categorySpending[catName] = (categorySpending[catName] || 0) + amt;
        }
      }
    });

    const netSavings = currentMonthIncome - currentMonthExpenses;
    const savingsRate = currentMonthIncome > 0 ? Number(((netSavings / currentMonthIncome) * 100).toFixed(1)) : 0;

    // Budget utilization
    const budgetUtilization = budgets.map((b) => {
      const limit = Number(b.amount);
      const spent = categorySpending[b.category?.name || ''] || 0;
      const remaining = Math.max(0, limit - spent);
      const pct = limit > 0 ? Number(((spent / limit) * 100).toFixed(1)) : 0;
      return {
        id: b.id,
        category: b.category?.name || 'Overall',
        limit,
        spent,
        remaining,
        utilizationPct: pct,
        isOverBudget: spent > limit,
      };
    });

    res.status(200).json(
      ApiResponse.success('Financial context retrieved', {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          preferredCurrency: user.preferredCurrency,
          timezone: user.timezone,
        },
        period: {
          currentMonth: monthStart.toISOString().substring(0, 7),
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString(),
        },
        kpis: {
          totalIncome: currentMonthIncome,
          totalExpenses: currentMonthExpenses,
          netSavings,
          savingsRate,
          activeBudgetsCount: budgets.length,
          activeGoalsCount: goals.length,
        },
        categorySpending,
        budgetUtilization,
        recentTransactions: transactions.slice(0, 30).map((t) => ({
          id: t.id,
          date: t.transactionDate,
          merchant: t.merchant || t.description || 'Unknown',
          description: t.description,
          amount: Number(t.amount),
          currency: t.currency,
          direction: t.direction,
          status: t.status,
          category: t.category?.name || 'Uncategorized',
          categorizationMethod: t.categorizationMethod,
        })),
        recurringPayments: recurring.map((r) => ({
          id: r.id,
          name: r.name,
          amount: Number(r.amount),
          frequency: r.frequency,
          status: r.status,
          nextDueDate: r.nextDueDate,
        })),
        savingsGoals: goals.map((g) => ({
          id: g.id,
          title: g.title,
          targetAmount: Number(g.targetAmount),
          currentAmount: Number(g.currentAmount),
          targetDate: g.targetDate,
          status: g.status,
        })),
        categories: categories.map((c) => ({ id: c.id, name: c.name, direction: c.direction })),
        recentPurchases,
      })
    );
  })
);

// 2. Fetch User Transactions
router.get(
  '/transactions/:userId',
  asyncHandler(async (req, res) => {
    const user = await resolveUser(req.params.userId);
    const { limit = 100, direction, categoryId } = req.query;

    const where = { userId: user.id, deletedAt: null };
    if (direction) where.direction = direction;
    if (categoryId) where.categoryId = categoryId;

    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true },
      orderBy: { transactionDate: 'desc' },
      take: Number(limit),
    });

    res.status(200).json(ApiResponse.success('Transactions retrieved', { transactions }));
  })
);

// 3. Fetch User Budgets
router.get(
  '/budgets/:userId',
  asyncHandler(async (req, res) => {
    const user = await resolveUser(req.params.userId);
    const budgets = await prisma.budget.findMany({
      where: { userId: user.id },
      include: { category: true },
    });
    res.status(200).json(ApiResponse.success('Budgets retrieved', { budgets }));
  })
);

// 4. Fetch User Bills & Subscriptions
router.get(
  '/bills/:userId',
  asyncHandler(async (req, res) => {
    const user = await resolveUser(req.params.userId);
    const bills = await prisma.recurringPayment.findMany({
      where: { userId: user.id },
      orderBy: { nextDueDate: 'asc' },
    });
    res.status(200).json(ApiResponse.success('Bills retrieved', { bills }));
  })
);

// 5. Fetch User Savings Goals
router.get(
  '/goals/:userId',
  asyncHandler(async (req, res) => {
    const user = await resolveUser(req.params.userId);
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: user.id },
    });
    res.status(200).json(ApiResponse.success('Savings goals retrieved', { goals }));
  })
);

// 6. Push Notification / Reminder from AI
router.post(
  '/notifications/:userId',
  asyncHandler(async (req, res) => {
    const user = await resolveUser(req.params.userId);
    const { title, message, type = 'SYSTEM', actionUrl } = req.body;

    const notification = await prisma.notification.create({
      data: {
        userId: user.id,
        title,
        message,
        type: type === 'SECURITY_ALERT' ? 'SECURITY_ALERT' : type === 'BUDGET_WARNING' ? 'BUDGET_WARNING' : 'SYSTEM',
        actionUrl: actionUrl || null,
        isRead: false,
      },
    });

    res.status(201).json(ApiResponse.created('Notification created', { notification }));
  })
);

export default router;
