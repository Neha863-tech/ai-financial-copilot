import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { hashSessionToken } from '../utils/sessionToken.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.COOKIE_NAME] ||
    req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const sessionTokenHash = hashSessionToken(token);

    // Verify session revocation if session exists in DB
    const session = await prisma.userSession.findUnique({
      where: { sessionTokenHash },
    });

    if (session) {
      if (session.status === 'REVOKED') {
        throw ApiError.unauthorized('Session has been revoked. Please sign in again.');
      }
      if (session.expiresAt < new Date()) {
        throw ApiError.unauthorized('Session expired. Please sign in again.');
      }
      req.sessionId = session.id;
      req.sessionTokenHash = sessionTokenHash;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
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
      throw ApiError.unauthorized('User not found');
    }

    if (user.status === 'SUSPENDED' || user.status === 'DEACTIVATED') {
      throw ApiError.forbidden(`Account is ${user.status.toLowerCase()}`);
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.unauthorized('Invalid or expired token');
  }
});

export const optionalAuthenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.COOKIE_NAME] ||
    req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      const sessionTokenHash = hashSessionToken(token);

      const session = await prisma.userSession.findUnique({
        where: { sessionTokenHash },
      });

      if (!session || session.status === 'ACTIVE') {
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
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

        if (user && user.status !== 'SUSPENDED' && user.status !== 'DEACTIVATED') {
          req.user = user;
          req.token = token;
          req.sessionId = session?.id;
          req.sessionTokenHash = sessionTokenHash;
          return next();
        }
      }
    } catch {
      // Continue to demo fallback
    }
  }

  try {
    const demoUser = (await prisma.user.findFirst({
      where: {
        OR: [
          { email: 'demo@example.com' },
          { email: 'arjun.sharma@example.com' },
        ],
      },
    })) || (await prisma.user.findFirst());

    if (demoUser) {
      req.user = demoUser;
    }
  } catch (e) {
    // If DB is offline, continue
  }

  next();
});
