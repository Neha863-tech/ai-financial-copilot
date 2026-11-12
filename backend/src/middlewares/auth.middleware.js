import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import prisma from '../db/prisma.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticate = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.COOKIE_NAME] || 
    req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw ApiError.unauthorized('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        preferredCurrency: true,
        timezone: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = user;
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
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          fullName: true,
          email: true,
          preferredCurrency: true,
          timezone: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (user) {
        req.user = user;
        return next();
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
