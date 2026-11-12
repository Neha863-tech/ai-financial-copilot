import bcrypt from 'bcryptjs';
import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { generateToken } from '../utils/generateToken.js';
import { hashSessionToken } from '../utils/sessionToken.js';
import { activityLogger } from './activityLogger.service.js';

const SALT_ROUNDS = 12;

export const authService = {
  async register({ fullName, email, password }, reqMeta = {}) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        status: 'ACTIVE',
        plan: 'PRO',
        emailVerified: true,
        notificationPreference: {
          create: {
            emailNewLogin: true,
            emailFailedLogin: true,
            emailPasswordChange: true,
            emailBudgetAlert: true,
            emailBillDue: true,
            emailWeeklyDigest: false,
            pushOverspend: true,
            inAppAlerts: true,
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        preferredCurrency: true,
        timezone: true,
        createdAt: true,
        status: true,
        plan: true,
      },
    });

    // Log account creation activity and security audit
    await activityLogger.logActivity({
      userId: user.id,
      category: 'ACCOUNT',
      eventType: 'ACCOUNT_CREATED',
      title: 'Account Registered',
      description: `Welcome to FinSight AI, ${fullName}! Account created.`,
      status: 'SUCCESS',
      entityType: 'User',
      entityId: user.id,
      sourceDevice: reqMeta.deviceName || 'Web Client',
      ipAddress: reqMeta.ipAddress,
    });

    await activityLogger.logSecurityAudit({
      userId: user.id,
      action: 'USER_REGISTRATION',
      entityType: 'User',
      entityId: user.id,
      details: { email, device: reqMeta.deviceName },
      ipAddress: reqMeta.ipAddress,
      userAgent: reqMeta.userAgent,
      riskLevel: 'LOW',
      outcome: 'SUCCESS',
    });

    return user;
  },

  async login({ email, password }, reqMeta = {}) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Record failed attempt for unrecognized user
      await activityLogger.recordLoginEvent({
        userId: null,
        status: 'FAILED',
        failureReason: 'Invalid credentials - email not found',
        ipAddress: reqMeta.ipAddress,
        userAgent: reqMeta.userAgent,
        device: reqMeta.deviceName,
        browser: reqMeta.browser,
        os: reqMeta.operatingSystem,
        location: reqMeta.location,
      });
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check account status
    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      await activityLogger.recordLoginEvent({
        userId: user.id,
        status: 'FAILED',
        failureReason: `Account is ${user.status.toLowerCase()}`,
        ipAddress: reqMeta.ipAddress,
        userAgent: reqMeta.userAgent,
        device: reqMeta.deviceName,
        browser: reqMeta.browser,
        os: reqMeta.operatingSystem,
        location: reqMeta.location,
      });
      throw ApiError.forbidden(`Your account has been ${user.status.toLowerCase()}. Please contact support.`);
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      // Record failed attempt for existing user
      await activityLogger.recordLoginEvent({
        userId: user.id,
        status: 'FAILED',
        failureReason: 'Invalid password',
        ipAddress: reqMeta.ipAddress,
        userAgent: reqMeta.userAgent,
        device: reqMeta.deviceName,
        browser: reqMeta.browser,
        os: reqMeta.operatingSystem,
        location: reqMeta.location,
      });
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Successful Login
    const token = generateToken(user.id);
    const sessionTokenHash = hashSessionToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const now = new Date();

    // Check if new device or browser
    const previousDeviceLogin = await prisma.userSession.findFirst({
      where: {
        userId: user.id,
        browser: reqMeta.browser || 'Unknown Browser',
        operatingSystem: reqMeta.operatingSystem || 'Unknown OS',
      },
    });

    const isNewDevice = !previousDeviceLogin;

    // Create active UserSession
    const session = await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionTokenHash,
        deviceName: reqMeta.deviceName || 'Desktop Workstation',
        browser: reqMeta.browser || 'Chrome Browser',
        operatingSystem: reqMeta.operatingSystem || 'Windows',
        ipAddress: reqMeta.ipAddress || '127.0.0.1',
        location: reqMeta.location || 'Bengaluru, India',
        status: 'ACTIVE',
        createdAt: now,
        lastActiveAt: now,
        expiresAt,
      },
    });

    // Record LoginEvent
    await activityLogger.recordLoginEvent({
      userId: user.id,
      status: 'SUCCESS',
      ipAddress: reqMeta.ipAddress,
      userAgent: reqMeta.userAgent,
      device: reqMeta.deviceName,
      browser: reqMeta.browser,
      os: reqMeta.operatingSystem,
      location: reqMeta.location,
    });

    // Update User lastLoginAt and lastSeenAt
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: now,
        lastSeenAt: now,
      },
    });

    // Log Activity
    await activityLogger.logActivity({
      userId: user.id,
      category: 'SECURITY',
      eventType: 'LOGIN_SUCCESS',
      title: 'Successful Sign In',
      description: `Signed in via ${reqMeta.browser || 'Web Browser'} on ${reqMeta.deviceName || 'Desktop'} from ${reqMeta.location || 'Local'}.`,
      status: 'SUCCESS',
      entityType: 'UserSession',
      entityId: session.id,
      sourceDevice: reqMeta.deviceName,
      ipAddress: reqMeta.ipAddress,
      metadata: { sessionId: session.id, browser: reqMeta.browser, os: reqMeta.operatingSystem },
    });

    // If new device, notify user
    if (isNewDevice) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: 'SECURITY_ALERT',
          title: 'New Device Login Detected',
          message: `Your account was accessed from a new device (${reqMeta.deviceName || 'Device'} - ${reqMeta.browser || 'Browser'}) at ${reqMeta.location || 'unknown location'}.`,
          isRead: false,
        },
      }).catch(() => {});
    }

    return {
      token,
      sessionId: session.id,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        preferredCurrency: user.preferredCurrency,
        timezone: user.timezone,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        status: user.status,
        createdAt: user.createdAt,
        lastLoginAt: now,
        lastSeenAt: now,
      },
    };
  },

  async logout(userId, token, reqMeta = {}) {
    const now = new Date();
    if (token) {
      const sessionTokenHash = hashSessionToken(token);
      await prisma.userSession.updateMany({
        where: { sessionTokenHash, status: 'ACTIVE' },
        data: {
          status: 'REVOKED',
          revokedAt: now,
        },
      }).catch(() => {});
    }

    if (userId) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          lastLogoutAt: now,
          lastSeenAt: now,
        },
      }).catch(() => {});

      await activityLogger.logActivity({
        userId,
        category: 'ACCOUNT',
        eventType: 'LOGOUT',
        title: 'Signed Out',
        description: 'User explicitly logged out of session.',
        status: 'SUCCESS',
        sourceDevice: reqMeta.deviceName,
        ipAddress: reqMeta.ipAddress,
      });
    }

    return { success: true };
  },

  async heartbeat(userId, token) {
    if (!userId) throw ApiError.unauthorized('User not authenticated');
    const now = new Date();

    if (token) {
      const sessionTokenHash = hashSessionToken(token);
      const session = await prisma.userSession.findUnique({
        where: { sessionTokenHash },
      });

      if (session) {
        if (session.status === 'REVOKED') {
          throw ApiError.unauthorized('Session has been revoked');
        }
        if (session.expiresAt < now) {
          await prisma.userSession.update({
            where: { id: session.id },
            data: { status: 'EXPIRED' },
          });
          throw ApiError.unauthorized('Session has expired');
        }

        // Throttle active update: only update if lastActiveAt was more than 30s ago
        const diffMs = now.getTime() - new Date(session.lastActiveAt).getTime();
        if (diffMs > 30 * 1000) {
          await prisma.userSession.update({
            where: { id: session.id },
            data: { lastActiveAt: now },
          });
          await prisma.user.update({
            where: { id: userId },
            data: { lastSeenAt: now },
          });
        }
      } else {
        // Session not found in DB (e.g. older token or stateless), update User lastSeenAt
        await prisma.user.update({
          where: { id: userId },
          data: { lastSeenAt: now },
        }).catch(() => {});
      }
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { lastSeenAt: now },
      }).catch(() => {});
    }

    return { success: true, lastSeenAt: now.toISOString() };
  },

  async getMe(userId) {
    const user = await prisma.user.findUnique({
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
        avatarUrl: true,
        status: true,
        plan: true,
        emailVerified: true,
        phoneVerified: true,
        twoFactorEnabled: true,
        lastLoginAt: true,
        lastSeenAt: true,
        lastLogoutAt: true,
        lastPasswordChangeAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  },
};
