import { authService } from '../services/auth.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { setTokenCookie, clearTokenCookie } from '../utils/generateToken.js';
import { getClientIp, parseUserAgent, getApproximateLocation } from '../utils/deviceParser.js';
import { env } from '../config/env.js';

function extractReqMeta(req) {
  const ipAddress = getClientIp(req);
  const userAgent = req.headers['user-agent'] || '';
  const parsed = parseUserAgent(userAgent);
  const location = getApproximateLocation(ipAddress);
  return {
    ipAddress,
    userAgent,
    location,
    ...parsed,
  };
}

export const authController = {
  register: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const user = await authService.register(req.body, meta);
    res.status(201).json(ApiResponse.created('User registered successfully', { user }));
  }),

  login: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const { token, user, sessionId } = await authService.login(req.body, meta);
    setTokenCookie(res, token);
    res.status(200).json(ApiResponse.success('Login successful', { user, token, sessionId }));
  }),

  logout: asyncHandler(async (req, res) => {
    const token = req.cookies?.[env.COOKIE_NAME] || req.headers.authorization?.replace('Bearer ', '');
    const meta = extractReqMeta(req);
    await authService.logout(req.user?.id, token, meta);
    clearTokenCookie(res);
    res.status(200).json(ApiResponse.success('Logged out successfully'));
  }),

  heartbeat: asyncHandler(async (req, res) => {
    const token = req.cookies?.[env.COOKIE_NAME] || req.headers.authorization?.replace('Bearer ', '');
    const result = await authService.heartbeat(req.user?.id, token);
    res.status(200).json(ApiResponse.success('Heartbeat recorded', result));
  }),

  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    res.status(200).json(ApiResponse.success('Current user profile', { user }));
  }),
};
