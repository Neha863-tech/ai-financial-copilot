import bcrypt from 'bcryptjs';
import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { activityLogger } from './activityLogger.service.js';

const SALT_ROUNDS = 12;

export const profileService = {
  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationPreference: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const activeSessionsCount = await prisma.userSession.count({
      where: { userId, status: 'ACTIVE' },
    });

    const totalActivitiesCount = await prisma.userActivity.count({
      where: { userId },
    });

    const recentLogins = await prisma.loginEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return {
      personalInfo: {
        id: user.id,
        avatarUrl: user.avatarUrl,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || '',
        username: user.username || user.email.split('@')[0],
        dateOfBirth: user.dateOfBirth,
        country: user.country || 'India',
        preferredCurrency: user.preferredCurrency,
        timezone: user.timezone,
        createdAt: user.createdAt,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      accountInfo: {
        userId: user.id,
        status: user.status,
        plan: user.plan,
        twoFactorEnabled: user.twoFactorEnabled,
        lastProfileUpdate: user.updatedAt,
        lastPasswordChange: user.lastPasswordChangeAt,
        lastLogin: user.lastLoginAt,
        lastSeen: user.lastSeenAt,
        lastLogout: user.lastLogoutAt,
        activeSessions: activeSessionsCount,
        totalActivities: totalActivitiesCount,
      },
      notificationPreferences: user.notificationPreference || {
        emailNewLogin: true,
        emailFailedLogin: true,
        emailPasswordChange: true,
        emailBudgetAlert: true,
        emailBillDue: true,
        emailWeeklyDigest: false,
        pushOverspend: true,
        inAppAlerts: true,
      },
      recentLogins,
    };
  },

  async updateProfile(userId, data, reqMeta = {}) {
    const allowed = {};
    if (data.fullName !== undefined) allowed.fullName = data.fullName.trim();
    if (data.phone !== undefined) allowed.phone = data.phone.trim();
    if (data.country !== undefined) allowed.country = data.country.trim();
    if (data.preferredCurrency !== undefined) allowed.preferredCurrency = data.preferredCurrency.trim().toUpperCase();
    if (data.timezone !== undefined) allowed.timezone = data.timezone.trim();
    if (data.avatarUrl !== undefined) allowed.avatarUrl = data.avatarUrl;
    if (data.dateOfBirth !== undefined) allowed.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth) : null;

    if (data.username !== undefined && data.username.trim()) {
      const cleanUsername = data.username.trim().toLowerCase();
      const existing = await prisma.user.findFirst({
        where: {
          username: cleanUsername,
          id: { not: userId },
        },
      });
      if (existing) {
        throw ApiError.conflict('Username is already taken by another user');
      }
      allowed.username = cleanUsername;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: allowed,
    });

    await activityLogger.logActivity({
      userId,
      category: 'ACCOUNT',
      eventType: 'PROFILE_UPDATED',
      title: 'Profile Updated',
      description: 'Personal profile information and preferences were updated.',
      status: 'SUCCESS',
      sourceDevice: reqMeta.deviceName,
      ipAddress: reqMeta.ipAddress,
    });

    await activityLogger.logSecurityAudit({
      userId,
      action: 'UPDATE_PROFILE',
      entityType: 'User',
      entityId: userId,
      details: { updatedFields: Object.keys(allowed) },
      ipAddress: reqMeta.ipAddress,
      userAgent: reqMeta.userAgent,
      riskLevel: 'LOW',
      outcome: 'SUCCESS',
    });

    return updated;
  },

  async updateAvatar(userId, avatarUrl, reqMeta = {}) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });

    await activityLogger.logActivity({
      userId,
      category: 'ACCOUNT',
      eventType: 'AVATAR_CHANGED',
      title: 'Profile Picture Changed',
      description: 'Profile photo was updated.',
      status: 'SUCCESS',
      sourceDevice: reqMeta.deviceName,
      ipAddress: reqMeta.ipAddress,
    });

    return updated;
  },

  async changePassword(userId, { currentPassword, newPassword, revokeOthers = true }, reqMeta = {}) {
    if (!newPassword || newPassword.length < 8) {
      throw ApiError.badRequest('New password must be at least 8 characters long');
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      await activityLogger.logSecurityAudit({
        userId,
        action: 'CHANGE_PASSWORD_FAIL',
        entityType: 'User',
        entityId: userId,
        details: { reason: 'Incorrect current password' },
        ipAddress: reqMeta.ipAddress,
        userAgent: reqMeta.userAgent,
        riskLevel: 'HIGH',
        outcome: 'DENIED',
      });
      throw ApiError.badRequest('Current password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const now = new Date();

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash: newPasswordHash,
        lastPasswordChangeAt: now,
      },
    });

    if (revokeOthers) {
      await prisma.userSession.updateMany({
        where: {
          userId,
          status: 'ACTIVE',
          sessionTokenHash: { not: reqMeta.sessionTokenHash || '' },
        },
        data: {
          status: 'REVOKED',
          revokedAt: now,
        },
      });
    }

    await activityLogger.logActivity({
      userId,
      category: 'SECURITY',
      eventType: 'PASSWORD_CHANGED',
      title: 'Password Changed Securely',
      description: 'Account password was successfully changed.',
      status: 'SUCCESS',
      sourceDevice: reqMeta.deviceName,
      ipAddress: reqMeta.ipAddress,
    });

    await activityLogger.logSecurityAudit({
      userId,
      action: 'CHANGE_PASSWORD_SUCCESS',
      entityType: 'User',
      entityId: userId,
      details: { revokedOtherSessions: revokeOthers },
      ipAddress: reqMeta.ipAddress,
      userAgent: reqMeta.userAgent,
      riskLevel: 'HIGH',
      outcome: 'SUCCESS',
    });

    await prisma.notification.create({
      data: {
        userId,
        type: 'SECURITY_ALERT',
        title: 'Password Changed',
        message: 'Your account password was recently changed. If this wasn\'t you, please reset your password immediately.',
        isRead: false,
      },
    }).catch(() => {});

    return { message: 'Password changed successfully' };
  },

  async getNotificationPreferences(userId) {
    let prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs) {
      prefs = await prisma.notificationPreference.create({
        data: { userId },
      });
    }

    return prefs;
  },

  async updateNotificationPreferences(userId, data) {
    const updated = await prisma.notificationPreference.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });

    return updated;
  },

  async exportUserData(userId, reqMeta = {}) {
    const [
      user,
      transactions,
      budgets,
      goals,
      recurring,
      accounts,
      purchases,
      sessions,
      activities,
    ] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          username: true,
          dateOfBirth: true,
          country: true,
          preferredCurrency: true,
          timezone: true,
          status: true,
          plan: true,
          emailVerified: true,
          createdAt: true,
        },
      }),
      prisma.transaction.findMany({ where: { userId } }),
      prisma.budget.findMany({ where: { userId } }),
      prisma.savingsGoal.findMany({ where: { userId } }),
      prisma.recurringPayment.findMany({ where: { userId } }),
      prisma.account.findMany({ where: { userId } }),
      prisma.purchase.findMany({ where: { userId } }),
      prisma.userSession.findMany({
        where: { userId },
        select: {
          id: true,
          deviceName: true,
          browser: true,
          operatingSystem: true,
          ipAddress: true,
          location: true,
          createdAt: true,
          lastActiveAt: true,
          status: true,
        },
      }),
      prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    await activityLogger.logActivity({
      userId,
      category: 'ACCOUNT',
      eventType: 'DATA_EXPORTED',
      title: 'GDPR Account Data Exported',
      description: 'Downloaded complete financial history and account data package.',
      status: 'INFO',
      sourceDevice: reqMeta.deviceName,
      ipAddress: reqMeta.ipAddress,
    });

    await activityLogger.logSecurityAudit({
      userId,
      action: 'DATA_EXPORT',
      entityType: 'User',
      entityId: userId,
      details: { exportTime: new Date().toISOString() },
      ipAddress: reqMeta.ipAddress,
      userAgent: reqMeta.userAgent,
      riskLevel: 'MEDIUM',
      outcome: 'SUCCESS',
    });

    return {
      exportVersion: '1.0',
      exportedAt: new Date().toISOString(),
      userProfile: user,
      financialData: {
        transactionsCount: transactions.length,
        transactions,
        budgets,
        savingsGoals: goals,
        recurringPayments: recurring,
        accounts,
        purchases,
      },
      securityAndActivity: {
        activeAndPastSessions: sessions,
        activityTimeline: activities,
      },
    };
  },

  async deleteAccount(userId, { confirmEmail, password }, reqMeta = {}) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw ApiError.notFound('User not found');

    if (user.email.toLowerCase() !== confirmEmail?.trim().toLowerCase()) {
      throw ApiError.badRequest('Confirmation email does not match your account email');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw ApiError.badRequest('Invalid password. Account deletion aborted.');
    }

    // Soft delete / deactivate user
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'DEACTIVATED' },
    });

    // Revoke all sessions
    await prisma.userSession.updateMany({
      where: { userId },
      data: { status: 'REVOKED', revokedAt: new Date() },
    });

    await activityLogger.logSecurityAudit({
      userId,
      action: 'ACCOUNT_DELETION_REQUEST',
      entityType: 'User',
      entityId: userId,
      details: { status: 'DEACTIVATED' },
      ipAddress: reqMeta.ipAddress,
      userAgent: reqMeta.userAgent,
      riskLevel: 'CRITICAL',
      outcome: 'SUCCESS',
    });

    return { message: 'Account successfully deactivated and all sessions terminated.' };
  },
};
