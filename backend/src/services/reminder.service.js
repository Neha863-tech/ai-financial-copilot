import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { Decimal } from '@prisma/client/runtime/library';

export const reminderService = {
  async list(userId, { status, upcoming } = {}) {
    const where = { userId };
    if (status) where.status = status;
    if (upcoming) {
      where.dueAt = { gte: new Date() };
      where.status = 'PENDING';
    }

    return prisma.reminder.findMany({
      where,
      include: { recurringPayment: true },
      orderBy: { dueAt: 'asc' },
    });
  },

  async create(userId, data) {
    if (data.recurringPaymentId) {
      const rp = await prisma.recurringPayment.findFirst({
        where: { id: data.recurringPaymentId, userId },
      });
      if (!rp) throw ApiError.badRequest('Invalid recurring payment');
    }

    return prisma.reminder.create({
      data: {
        userId,
        recurringPaymentId: data.recurringPaymentId || null,
        title: data.title,
        amount: data.amount ? new Decimal(data.amount) : null,
        currency: data.currency || null,
        dueAt: new Date(data.dueAt),
        status: data.status || 'PENDING',
      },
      include: { recurringPayment: true },
    });
  },

  async update(userId, id, data) {
    const existing = await prisma.reminder.findFirst({
      where: { id, userId },
    });
    if (!existing) throw ApiError.notFound('Reminder not found');

    const updateData = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.amount !== undefined) updateData.amount = data.amount ? new Decimal(data.amount) : null;
    if (data.currency !== undefined) updateData.currency = data.currency;
    if (data.dueAt !== undefined) updateData.dueAt = new Date(data.dueAt);
    if (data.status !== undefined) updateData.status = data.status;

    return prisma.reminder.update({
      where: { id },
      data: updateData,
      include: { recurringPayment: true },
    });
  },

  async delete(userId, id) {
    const existing = await prisma.reminder.findFirst({
      where: { id, userId },
    });
    if (!existing) throw ApiError.notFound('Reminder not found');

    await prisma.reminder.delete({ where: { id } });
    return { message: 'Reminder deleted successfully' };
  },

  async getUpcoming(userId, days = 7) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return prisma.reminder.findMany({
      where: {
        userId,
        status: 'PENDING',
        dueAt: { gte: now, lte: futureDate },
      },
      include: { recurringPayment: true },
      orderBy: { dueAt: 'asc' },
    });
  },
};

