import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import prisma from '../db/prisma.js';

const router = Router();
router.use(authenticate);

// GET /api/v1/goals
router.get('/', asyncHandler(async (req, res) => {
  const goals = await prisma.savingsGoal.findMany({
    where: { userId: req.user.id },
    orderBy: { targetDate: 'asc' },
  });

  const formatted = goals.map((g) => {
    const target = Number(g.targetAmount);
    const current = Number(g.currentAmount);
    const pct = target > 0 ? Number(((current / target) * 100).toFixed(1)) : 0;
    const remaining = Math.max(0, target - current);
    const monthsLeft = Math.max(1, Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30)));
    const recommendedMonthly = Math.round(remaining / monthsLeft);

    return {
      id: g.id,
      title: g.title,
      targetAmount: target,
      currentAmount: current,
      remainingAmount: remaining,
      currency: g.currency,
      targetDate: g.targetDate,
      category: g.category || 'General Savings',
      status: g.status,
      progressPct: pct,
      monthsLeft,
      recommendedMonthly,
    };
  });

  res.status(200).json(ApiResponse.success('Savings goals retrieved', { goals: formatted }));
}));

// POST /api/v1/goals
router.post('/', asyncHandler(async (req, res) => {
  const { title, targetAmount, currentAmount = 0, currency = 'INR', targetDate, category } = req.body;

  const goal = await prisma.savingsGoal.create({
    data: {
      userId: req.user.id,
      title,
      targetAmount,
      currentAmount,
      currency,
      targetDate: new Date(targetDate),
      category,
    },
  });

  res.status(201).json(ApiResponse.success('Savings goal created', { goal }));
}));

// PATCH /api/v1/goals/:id
router.patch('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentAmount, title, targetAmount, status } = req.body;

  const updateData = {};
  if (currentAmount !== undefined) updateData.currentAmount = currentAmount;
  if (title) updateData.title = title;
  if (targetAmount) updateData.targetAmount = targetAmount;
  if (status) updateData.status = status;

  const goal = await prisma.savingsGoal.update({
    where: { id, userId: req.user.id },
    data: updateData,
  });

  res.status(200).json(ApiResponse.success('Savings goal updated', { goal }));
}));

// DELETE /api/v1/goals/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await prisma.savingsGoal.delete({
    where: { id, userId: req.user.id },
  });
  res.status(200).json(ApiResponse.success('Savings goal deleted', { id }));
}));

export default router;
