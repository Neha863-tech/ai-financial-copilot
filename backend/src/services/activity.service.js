import prisma from '../db/prisma.js';

export const activityService = {
  async getActivityTimeline(userId, { category, search, startDate, endDate, page = 1, limit = 30 }) {
    const where = { userId };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search && search.trim()) {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { eventType: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [activities, total, categoryCounts] = await Promise.all([
      prisma.userActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.userActivity.count({ where }),
      prisma.userActivity.groupBy({
        by: ['category'],
        where: { userId },
        _count: { _all: true },
      }),
    ]);

    const counts = {
      ALL: 0,
      ACCOUNT: 0,
      FINANCIAL: 0,
      PAYMENTS: 0,
      SECURITY: 0,
      INTEGRATION: 0,
    };

    categoryCounts.forEach((c) => {
      counts[c.category] = c._count._all;
      counts.ALL += c._count._all;
    });

    return {
      activities,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
      categoryCounts: counts,
    };
  },

  async exportActivityCsv(userId) {
    const activities = await prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const headers = ['Timestamp', 'Category', 'Event Type', 'Title', 'Description', 'Status', 'Device', 'IP Address'];
    const rows = activities.map((a) => [
      `"${a.createdAt.toISOString()}"`,
      `"${a.category}"`,
      `"${a.eventType}"`,
      `"${(a.title || '').replace(/"/g, '""')}"`,
      `"${(a.description || '').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.sourceDevice || ''}"`,
      `"${a.ipAddress || ''}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  async getAuditLogs(userId, { riskLevel, outcome, search, page = 1, limit = 50 }) {
    const where = { userId };

    if (riskLevel && riskLevel !== 'ALL') {
      where.riskLevel = riskLevel;
    }

    if (outcome && outcome !== 'ALL') {
      where.outcome = outcome;
    }

    if (search && search.trim()) {
      where.OR = [
        { action: { contains: search.trim(), mode: 'insensitive' } },
        { entityType: { contains: search.trim(), mode: 'insensitive' } },
        { entityId: { contains: search.trim(), mode: 'insensitive' } },
      ];
    }

    const take = Number(limit);
    const skip = (Number(page) - 1) * take;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page: Number(page),
        limit: take,
        totalPages: Math.ceil(total / take) || 1,
      },
    };
  },
};
