import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { activityLogger } from './activityLogger.service.js';

export const sessionService = {
  async getSessions(userId, currentSessionTokenHash) {
    const sessions = await prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
      select: {
        id: true,
        deviceName: true,
        browser: true,
        operatingSystem: true,
        ipAddress: true,
        location: true,
        status: true,
        createdAt: true,
        lastActiveAt: true,
        expiresAt: true,
        revokedAt: true,
        sessionTokenHash: true,
      },
    });

    return sessions.map((s) => ({
      id: s.id,
      deviceName: s.deviceName,
      browser: s.browser,
      operatingSystem: s.operatingSystem,
      ipAddress: s.ipAddress,
      location: s.location || 'Unknown Location',
      status: s.status,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      expiresAt: s.expiresAt,
      revokedAt: s.revokedAt,
      isCurrent: currentSessionTokenHash ? s.sessionTokenHash === currentSessionTokenHash : false,
    }));
  },

  async revokeSession(userId, sessionId, reqMeta = {}) {
    const session = await prisma.userSession.findFirst({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw ApiError.notFound('Session not found');
    }

    if (session.status === 'REVOKED') {
      return { message: 'Session is already revoked' };
    }

    const updated = await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await activityLogger.logActivity({
      userId,
      category: 'SECURITY',
      eventType: 'SESSION_REVOKED',
      title: 'Device Session Revoked',
      description: `Revoked session for ${session.deviceName} (${session.browser}).`,
      status: 'SUCCESS',
      entityType: 'UserSession',
      entityId: session.id,
      sourceDevice: reqMeta.deviceName,
      ipAddress: reqMeta.ipAddress,
    });

    await activityLogger.logSecurityAudit({
      userId,
      action: 'SESSION_REVOKED',
      entityType: 'UserSession',
      entityId: session.id,
      details: { revokedSessionId: session.id, device: session.deviceName },
      ipAddress: reqMeta.ipAddress,
      userAgent: reqMeta.userAgent,
      riskLevel: 'MEDIUM',
      outcome: 'SUCCESS',
    });

    return updated;
  },

  async revokeOtherSessions(userId, currentSessionTokenHash, reqMeta = {}) {
    const result = await prisma.userSession.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
        sessionTokenHash: { not: currentSessionTokenHash || '' },
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await activityLogger.logActivity({
      userId,
      category: 'SECURITY',
      eventType: 'OTHER_SESSIONS_REVOKED',
      title: 'Logged Out Other Devices',
      description: `Revoked ${result.count} other active device sessions.`,
      status: 'SUCCESS',
      sourceDevice: reqMeta.deviceName,
      ipAddress: reqMeta.ipAddress,
    });

    await activityLogger.logSecurityAudit({
      userId,
      action: 'REVOKE_OTHER_SESSIONS',
      entityType: 'UserSession',
      entityId: userId,
      details: { count: result.count },
      ipAddress: reqMeta.ipAddress,
      userAgent: reqMeta.userAgent,
      riskLevel: 'MEDIUM',
      outcome: 'SUCCESS',
    });

    return { revokedCount: result.count };
  },

  async revokeAllSessions(userId, reqMeta = {}) {
    const result = await prisma.userSession.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'REVOKED',
        revokedAt: new Date(),
      },
    });

    await activityLogger.logActivity({
      userId,
      category: 'SECURITY',
      eventType: 'ALL_SESSIONS_REVOKED',
      title: 'All Device Sessions Revoked',
      description: `Revoked all ${result.count} active device sessions.`,
      status: 'WARNING',
      sourceDevice: reqMeta.deviceName,
      ipAddress: reqMeta.ipAddress,
    });

    await activityLogger.logSecurityAudit({
      userId,
      action: 'REVOKE_ALL_SESSIONS',
      entityType: 'UserSession',
      entityId: userId,
      details: { count: result.count },
      ipAddress: reqMeta.ipAddress,
      userAgent: reqMeta.userAgent,
      riskLevel: 'HIGH',
      outcome: 'SUCCESS',
    });

    return { revokedCount: result.count };
  },

  async getLoginHistory(userId, limit = 20) {
    return await prisma.loginEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      select: {
        id: true,
        status: true,
        failureReason: true,
        device: true,
        browser: true,
        os: true,
        ipAddress: true,
        location: true,
        createdAt: true,
      },
    });
  },
};
