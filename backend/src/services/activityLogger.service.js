import prisma from '../db/prisma.js';

export const activityLogger = {
  /**
   * Logs a user-visible chronological activity event.
   */
  async logActivity({
    userId,
    category = 'ACCOUNT',
    eventType,
    title,
    description,
    status = 'SUCCESS',
    entityType = null,
    entityId = null,
    sourceDevice = null,
    ipAddress = null,
    metadata = null,
  }) {
    if (!userId) return null;
    try {
      return await prisma.userActivity.create({
        data: {
          userId,
          category,
          eventType,
          title,
          description,
          status,
          entityType,
          entityId: entityId ? String(entityId) : null,
          sourceDevice,
          ipAddress,
          metadata: metadata || undefined,
        },
      });
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[activityLogger.logActivity] Error logging activity:', err.message);
      }
      return null;
    }
  },

  /**
   * Logs an append-only security and compliance audit trail event.
   */
  async logSecurityAudit({
    userId,
    action,
    entityType,
    entityId,
    details = null,
    ipAddress = null,
    userAgent = null,
    riskLevel = 'LOW', // LOW, MEDIUM, HIGH, CRITICAL
    outcome = 'SUCCESS', // SUCCESS, FAILURE, DENIED
    requestId = null,
    changeDetails = null,
  }) {
    if (!userId) return null;
    try {
      const log = await prisma.auditLog.create({
        data: {
          userId,
          action,
          entityType: entityType || 'SECURITY',
          entityId: entityId ? String(entityId) : 'SYSTEM',
          details: details || undefined,
          ipAddress,
          userAgent,
          riskLevel,
          outcome,
          requestId,
          changeDetails: changeDetails || undefined,
        },
      });

      // If high or critical risk, also create an in-app notification for the user
      if (riskLevel === 'HIGH' || riskLevel === 'CRITICAL' || outcome === 'DENIED') {
        await prisma.notification.create({
          data: {
            userId,
            type: 'SECURITY_ALERT',
            title: `Security Alert: ${action}`,
            message: `A ${riskLevel.toLowerCase()}-risk security event (${action}) occurred. Result: ${outcome}.`,
            isRead: false,
          },
        }).catch(() => {});
      }

      return log;
    } catch (err) {
      console.error('[activityLogger.logSecurityAudit] Error logging audit:', err.message);
      return null;
    }
  },

  /**
   * Records a login attempt (successful or failed).
   */
  async recordLoginEvent({
    userId,
    status, // SUCCESS, FAILED
    failureReason = null,
    ipAddress = null,
    userAgent = null,
    device = null,
    browser = null,
    os = null,
    location = null,
  }) {
    try {
      const event = await prisma.loginEvent.create({
        data: {
          userId: userId || undefined,
          status,
          failureReason,
          ipAddress,
          userAgent,
          device,
          browser,
          os,
          location,
        },
      });

      if (status === 'FAILED' && userId) {
        // Check failed attempts in the last 15 minutes
        const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
        const recentFails = await prisma.loginEvent.count({
          where: {
            userId,
            status: 'FAILED',
            createdAt: { gte: fifteenMinsAgo },
          },
        });

        if (recentFails >= 3) {
          await this.logSecurityAudit({
            userId,
            action: 'LOGIN_FAIL_THRESHOLD_EXCEEDED',
            entityType: 'AUTH',
            entityId: userId,
            details: { count: recentFails, ipAddress, userAgent },
            ipAddress,
            userAgent,
            riskLevel: 'HIGH',
            outcome: 'DENIED',
          });
        }
      }

      return event;
    } catch (err) {
      console.error('[activityLogger.recordLoginEvent] Error recording login event:', err.message);
      return null;
    }
  },
};
