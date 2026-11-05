import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';

export const recurringService = {
  async list(userId, { status } = {}) {
    const where = { userId };
    if (status) where.status = status;

    return prisma.recurringPayment.findMany({
      where,
      orderBy: { nextDueAt: 'asc' },
    });
  },

  async confirm(userId, id) {
    const rp = await prisma.recurringPayment.findFirst({ where: { id, userId } });
    if (!rp) throw ApiError.notFound('Recurring payment not found');

    return prisma.recurringPayment.update({
      where: { id },
      data: { status: 'CONFIRMED' },
    });
  },

  async dismiss(userId, id) {
    const rp = await prisma.recurringPayment.findFirst({ where: { id, userId } });
    if (!rp) throw ApiError.notFound('Recurring payment not found');

    return prisma.recurringPayment.update({
      where: { id },
      data: { status: 'DISMISSED' },
    });
  },

  async update(userId, id, data) {
    const rp = await prisma.recurringPayment.findFirst({ where: { id, userId } });
    if (!rp) throw ApiError.notFound('Recurring payment not found');

    const updateData = {};
    if (data.frequency) updateData.frequency = data.frequency;
    if (data.nextDueAt) updateData.nextDueAt = new Date(data.nextDueAt);
    if (data.expectedAmount) updateData.expectedAmount = data.expectedAmount;
    if (data.status) updateData.status = data.status;

    return prisma.recurringPayment.update({
      where: { id },
      data: updateData,
    });
  },

  async detectRecurring(userId) {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        direction: 'EXPENSE',
        status: 'COMPLETED',
        deletedAt: null,
        merchant: { not: null },
      },
      orderBy: { transactionDate: 'asc' },
      select: {
        merchant: true,
        amount: true,
        currency: true,
        transactionDate: true,
      },
    });

    const merchantGroups = {};
    for (const txn of transactions) {
      const key = normalizeMerchant(txn.merchant);
      if (!merchantGroups[key]) {
        merchantGroups[key] = { merchant: txn.merchant, merchantKey: key, transactions: [] };
      }
      merchantGroups[key].transactions.push(txn);
    }

    const detectedRecurring = [];

    for (const [merchantKey, group] of Object.entries(merchantGroups)) {
      const txns = group.transactions;
      if (txns.length < 2) continue;

      const amounts = txns.map(t => Number(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const withinTolerance = amounts.every(a => Math.abs(a - avgAmount) / (avgAmount || 1) < 0.15);

      if (!withinTolerance) continue;

      const dates = txns.map(t => new Date(t.transactionDate).getTime());
      const intervals = [];
      for (let i = 1; i < dates.length; i++) {
        intervals.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      let frequency = 'UNKNOWN';
      if (avgInterval >= 5 && avgInterval <= 10) frequency = 'WEEKLY';
      else if (avgInterval >= 25 && avgInterval <= 35) frequency = 'MONTHLY';
      else if (avgInterval >= 350 && avgInterval <= 380) frequency = 'YEARLY';

      let confidence = 'LOW';
      if (txns.length >= 3 && withinTolerance && frequency !== 'UNKNOWN') confidence = 'HIGH';
      else if (txns.length >= 2 && withinTolerance) confidence = 'MEDIUM';

      const lastDate = new Date(Math.max(...dates));
      let nextDueAt = null;
      if (frequency === 'WEEKLY') nextDueAt = new Date(lastDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      else if (frequency === 'MONTHLY') {
        nextDueAt = new Date(lastDate);
        nextDueAt.setMonth(nextDueAt.getMonth() + 1);
      } else if (frequency === 'YEARLY') {
        nextDueAt = new Date(lastDate);
        nextDueAt.setFullYear(nextDueAt.getFullYear() + 1);
      }

      detectedRecurring.push({
        merchant: group.merchant,
        merchantKey,
        expectedAmount: avgAmount.toFixed(2),
        currency: txns[0].currency,
        frequency,
        confidence,
        nextDueAt,
        lastObservedAt: new Date(Math.max(...dates)),
      });
    }

    const results = [];
    for (const rp of detectedRecurring) {
      const existing = await prisma.recurringPayment.findFirst({
        where: { userId, merchantKey: rp.merchantKey },
      });

      if (existing) {
        if (existing.status !== 'DISMISSED' && existing.status !== 'CANCELLED') {
          const updated = await prisma.recurringPayment.update({
            where: { id: existing.id },
            data: {
              expectedAmount: rp.expectedAmount,
              frequency: rp.frequency,
              confidence: rp.confidence,
              nextDueAt: rp.nextDueAt,
              lastObservedAt: rp.lastObservedAt,
            },
          });
          results.push(updated);
        }
      } else {
        const created = await prisma.recurringPayment.create({
          data: {
            userId,
            ...rp,
          },
        });
        results.push(created);
      }
    }

    return results;
  },
};

function normalizeMerchant(merchant) {
  return (merchant || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

