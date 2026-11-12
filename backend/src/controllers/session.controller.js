import { sessionService } from '../services/session.service.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getClientIp, parseUserAgent, getApproximateLocation } from '../utils/deviceParser.js';

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

export const sessionController = {
  getSessions: asyncHandler(async (req, res) => {
    const sessions = await sessionService.getSessions(req.user.id, req.sessionTokenHash);
    res.status(200).json(ApiResponse.success('User sessions retrieved', { sessions }));
  }),

  revokeSession: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const result = await sessionService.revokeSession(req.user.id, req.params.id, meta);
    res.status(200).json(ApiResponse.success('Session revoked successfully', result));
  }),

  revokeOthers: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const result = await sessionService.revokeOtherSessions(req.user.id, req.sessionTokenHash, meta);
    res.status(200).json(ApiResponse.success('Other sessions revoked successfully', result));
  }),

  revokeAll: asyncHandler(async (req, res) => {
    const meta = extractReqMeta(req);
    const result = await sessionService.revokeAllSessions(req.user.id, meta);
    res.status(200).json(ApiResponse.success('All sessions revoked successfully', result));
  }),

  getLoginHistory: asyncHandler(async (req, res) => {
    const limit = req.query.limit || 20;
    const history = await sessionService.getLoginHistory(req.user.id, limit);
    res.status(200).json(ApiResponse.success('Login history retrieved', { history }));
  }),
};
