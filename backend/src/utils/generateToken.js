import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const generateToken = (userId) => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const setTokenCookie = (res, token) => {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    path: '/',
  });
};

export const clearTokenCookie = (res) => {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    path: '/',
  });
};
